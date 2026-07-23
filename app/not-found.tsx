import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-6 py-24 text-center">
      <p className="font-display text-3xl">Страница не найдена</p>
      <p className="mt-2 text-sm text-ink/60">Товар мог закончиться или ссылка устарела.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        В каталог
      </Link>
    </div>
  );
}
