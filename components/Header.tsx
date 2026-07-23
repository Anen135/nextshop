"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

const categories = [
  { name: "Furniture", slug: "furniture" },
  { name: "Lighting", slug: "lighting" },
  { name: "Textiles", slug: "textile" },
  { name: "Ceramics", slug: "ceramics" },
];

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl tracking-tight">
          NextShop
        </Link>

        <nav className="hidden gap-6 md:flex" aria-label="Catalog categories">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/?category=${c.slug}`}
              className="text-sm text-ink/70 transition-colors hover:text-ink"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="relative text-sm font-medium"
          aria-label={`Cart, items: ${itemCount}`}
        >
          Cart
          {itemCount > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-xs text-paper">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
