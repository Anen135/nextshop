import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getOrCreateCart, getCartTotalCents } from "@/lib/cart";

export async function GET() {
  const cart = await getOrCreateCart();
  return NextResponse.json({
    items: cart.items,
    totalCents: getCartTotalCents(cart.items),
  });
}

const addItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99).default(1),
});

// POST /api/cart — добавить товар (или увеличить количество)
export async function POST(req: NextRequest) {
  const body = addItemSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const { productId, quantity } = body.data;
  const cart = await getOrCreateCart();

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }
  if (product.stock < quantity) {
    return NextResponse.json({ error: "Недостаточно товара на складе" }, { status: 409 });
  }

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
  });

  const updated = await db.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({
    items: updated.items,
    totalCents: getCartTotalCents(updated.items),
  });
}

const updateItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(0).max(99),
});

// PATCH /api/cart — изменить количество (0 = удалить)
export async function PATCH(req: NextRequest) {
  const body = updateItemSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }
  const { productId, quantity } = body.data;
  const cart = await getOrCreateCart();

  if (quantity === 0) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  } else {
    await db.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });
  }

  const updated = await db.cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json({
    items: updated.items,
    totalCents: getCartTotalCents(updated.items),
  });
}
