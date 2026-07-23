export type Money = { amountCents: number; currency: string };

export function formatMoney({ amountCents, currency }: Money): string {
  const amount = amountCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export type CheckoutInput = {
  sessionId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
};
