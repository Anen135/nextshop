import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { constructWebhookEvent } from "@/lib/payment";

/** Обрабатывает подтверждения оплаты от Stripe (асинхронные webhook'и). */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as { id: string };
      await db.order.updateMany({
        where: { paymentIntentId: intent.id },
        data: { status: "PAID" },
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as { id: string };
      await db.order.updateMany({
        where: { paymentIntentId: intent.id },
        data: { status: "FAILED" },
      });
      break;
    }
    default:
      // Пропускаем нерелевантные события
      break;
  }

  // Stripe требует быстрый 2xx, иначе ретраи
  return NextResponse.json({ received: true });
}
