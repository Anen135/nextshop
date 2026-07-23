"use client";

import { useState, useTransition } from "react";
import { useCart } from "./CartProvider";

export default function AddToCartButton({ productId, inStock }: { productId: string; inStock: boolean }) {
  const { refreshCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    startTransition(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        await refreshCart();
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }
    });
  }

  if (!inStock) {
    return (
      <button className="btn-secondary w-full" disabled>
        Нет в наличии
      </button>
    );
  }

  return (
    <button onClick={handleAdd} disabled={isPending} className="btn-primary w-full">
      {isPending ? "Добавляем…" : added ? "Добавлено ✓" : "В корзину"}
    </button>
  );
}
