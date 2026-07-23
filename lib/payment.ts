import Stripe from "stripe";

/**
 * Тонкая обёртка над Stripe.
 *
 * Зачем обёртка, а не прямой вызов Stripe по всему коду:
 * 1. Единая точка для смены провайдера (ЮKassa/CloudPayments для РФ-рынка
 *    имеют похожий API — достаточно переписать этот файл).
 * 2. Тестируемость: в юнит-тестах можно замокать этот модуль целиком.
 * 3. Явный контракт (createPaymentIntent / verifyWebhook) вместо утечки
 *    деталей Stripe SDK в бизнес-логику checkout.
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// В демо-режиме (без ключей) сервис не падает, а работает в "mock"-режиме —
// это важно для портфолио: проект должен запускаться и без реальных
// платёжных credentials.
const isMock = !stripeSecretKey;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : null;

export type CreatePaymentIntentParams = {
  amountCents: number;
  currency: string;
  orderId: string;
  customerEmail: string;
};

export type PaymentIntentResult = {
  id: string;
  clientSecret: string;
  status: "requires_payment_method" | "succeeded" | "processing";
};

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResult> {
  if (isMock || !stripe) {
    // Мок-режим — эмулируем моментальный успешный платёж, чтобы можно было
    // пройти весь флоу оформления заказа без ключей Stripe.
    return {
      id: `pi_mock_${params.orderId}`,
      clientSecret: `pi_mock_${params.orderId}_secret`,
      status: "succeeded",
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: params.currency.toLowerCase(),
    receipt_email: params.customerEmail,
    metadata: { orderId: params.orderId },
    automatic_payment_methods: { enabled: true },
  });

  return {
    id: intent.id,
    clientSecret: intent.client_secret ?? "",
    status: intent.status as PaymentIntentResult["status"],
  };
}

/**
 * Проверяет подпись входящего Stripe webhook, чтобы исключить поддельные
 * запросы на /api/webhooks/stripe. Обязательный шаг в проде.
 */
export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  if (isMock || !stripe) {
    throw new Error("Webhook verification requires a real STRIPE_SECRET_KEY");
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

export const paymentProviderMode = isMock ? "mock" : "stripe";
