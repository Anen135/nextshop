import Link from "next/link";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  return (
    <div className="mx-auto max-w-content px-6 py-24 text-center">
      <p className="eyebrow mb-3">Thank you</p>
      <h1 className="font-display text-3xl">Order confirmed</h1>
      {searchParams.order && (
        <p className="mt-4 text-ink/70">
          Order number: <span className="font-medium text-ink">{searchParams.order}</span>
        </p>
      )}
      <p className="mt-2 text-sm text-ink/50">
        Confirmation has been sent to your email. Our manager will contact you for delivery details.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Back to catalog
      </Link>
    </div>
  );
}
