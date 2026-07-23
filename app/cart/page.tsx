"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/types";
import { useCart } from "@/components/CartProvider";

type CartItem = {
  productId: string;
  quantity: number;
  product: { title: string; priceCents: number; currency: string; imageUrl: string; slug: string };
};

export default function CartPage() {
  const { refreshCart } = useCart();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalCents, setTotalCents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  async function load() {
    const res = await fetch("/api/cart", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items);
    setTotalCents(data.totalCents);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateQuantity(productId: string, quantity: number) {
    startTransition(async () => {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      await Promise.all([load(), refreshCart()]);
    });
  }

  if (loading) {
    return <div className="mx-auto max-w-content px-6 py-12 text-ink/50">Loading cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-6 py-24 text-center">
        <p className="font-display text-2xl">Cart is empty</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Cart</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-6">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-line">
                <Image src={item.product.imageUrl} alt={item.product.title} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <Link href={`/products/${item.product.slug}`} className="text-sm font-medium hover:underline">
                    {item.product.title}
                  </Link>
                  <p className="text-sm text-ink/70">
                    {formatMoney({ amountCents: item.product.priceCents * item.quantity, currency: item.product.currency })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-xs text-ink/50" htmlFor={`qty-${item.productId}`}>
                      Qty
                    </label>
                  <input
                    id={`qty-${item.productId}`}
                    type="number"
                    min={0}
                    max={99}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                    className="w-16 border border-line px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => updateQuantity(item.productId, 0)}
                    className="text-xs text-ink/50 underline hover:text-clay"
                  >
                      Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-line p-6">
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">Total</span>
            <span className="font-medium">{formatMoney({ amountCents: totalCents, currency: "RUB" })}</span>
          </div>
          <p className="mt-2 text-xs text-ink/50">Shipping calculated at next step</p>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
