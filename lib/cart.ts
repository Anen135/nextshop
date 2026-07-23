import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "./db";

const CART_COOKIE = "ns_cart_session";

/** Гостевая корзина по httpOnly cookie — без регистрации. */
export async function getOrCreateCart() {
  const cookieStore = cookies();
  let sessionId = cookieStore.get(CART_COOKIE)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(CART_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      path: "/",
    });
  }

  const cart = await db.cart.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
    include: { items: { include: { product: true } } },
  });

  return cart;
}

export function getCartTotalCents(items: { quantity: number; product: { priceCents: number } }[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.product.priceCents, 0);
}
