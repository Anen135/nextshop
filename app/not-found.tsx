import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-6 py-24 text-center">
      <p className="font-display text-3xl">Page not found</p>
      <p className="mt-2 text-sm text-ink/60">The product may be out of stock or the link is outdated.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Back to catalog
      </Link>
    </div>
  );
}
