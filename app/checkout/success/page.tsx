import Link from "next/link";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  return (
    <div className="mx-auto max-w-content px-6 py-24 text-center">
      <p className="eyebrow mb-3">Спасибо</p>
      <h1 className="font-display text-3xl">Заказ принят</h1>
      {searchParams.order && (
        <p className="mt-4 text-ink/70">
          Номер заказа: <span className="font-medium text-ink">{searchParams.order}</span>
        </p>
      )}
      <p className="mt-2 text-sm text-ink/50">
        Подтверждение отправлено на e-mail. Менеджер свяжется с вами для уточнения деталей доставки.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Вернуться в каталог
      </Link>
    </div>
  );
}
