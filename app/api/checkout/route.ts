import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getOrCreateCart, getCartTotalCents } from "@/lib/cart";
import { createPaymentIntent } from "@/lib/payment";
import { getCrmClient } from "@/lib/crm";

const checkoutSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Invalid e-mail"),
  phone: z.string().min(6, "Enter your phone number"),
  address: z.string().min(5, "Enter your delivery address"),
});

/** Place order: validation, stock deduction, payment, CRM. */
export async function POST(req: NextRequest) {
  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, phone, address } = parsed.data;

  const cart = await getOrCreateCart();
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Product "${item.product.title}" is out of stock` },
        { status: 409 }
      );
    }
  }

  const totalCents = getCartTotalCents(cart.items);
  const orderNumber = `NS-${Date.now().toString().slice(-8)}`;

  const order = await db.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email },
      update: { name, phone },
      create: { email, name, phone },
    });

    const created = await tx.order.create({
      data: {
        number: orderNumber,
        customerId: customer.id,
        totalCents,
        shippingName: name,
        shippingEmail: email,
        shippingPhone: phone,
        shippingAddress: address,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceCents: item.product.priceCents,
          })),
        },
      },
      include: { items: { include: { product: true } }, customer: true },
    });

    // Deduct stock immediately to prevent overselling
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear the cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  const paymentIntent = await createPaymentIntent({
    amountCents: totalCents,
    currency: order.currency,
    orderId: order.id,
    customerEmail: email,
  });

  await db.order.update({
    where: { id: order.id },
    data: { paymentIntentId: paymentIntent.id },
  });

  // CRM sync should not break checkout — log errors only
  try {
    const crm = getCrmClient();
    const { dealId } = await crm.upsertDeal(order);
    await db.order.update({ where: { id: order.id }, data: { crmDealId: dealId } });
  } catch (err) {
    console.error(`CRM sync failed for order ${order.number}:`, err);
  }

  return NextResponse.json({
    orderNumber: order.number,
    paymentIntent,
  });
}
