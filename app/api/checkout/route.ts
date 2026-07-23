import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getOrCreateCart, getCartTotalCents } from "@/lib/cart";
import { createPaymentIntent } from "@/lib/payment";
import { getCrmClient } from "@/lib/crm";

const checkoutSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  email: z.string().email("Некорректный e-mail"),
  phone: z.string().min(6, "Укажите телефон"),
  address: z.string().min(5, "Укажите адрес доставки"),
});

/** Оформление заказа: валидация, списание, платёж, CRM. */
export async function POST(req: NextRequest) {
  const parsed = checkoutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, phone, address } = parsed.data;

  const cart = await getOrCreateCart();
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
  }

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Товар «${item.product.title}» закончился на складе` },
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

    // Списываем со склада сразу, чтобы исключить перепродажу
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Очищаем корзину
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

  // CRM-синхронизация не должна ронять оформление — пробрасываем ошибку в лог
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
