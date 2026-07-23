import Stripe from "stripe";

/** Stripe wrapper — single point to swap payment providers. */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Without keys — mock mode, so the project runs without real credentials
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
    // Mock mode: emulate successful payment without Stripe keys
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

/** Verifies Stripe webhook signature. */
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
