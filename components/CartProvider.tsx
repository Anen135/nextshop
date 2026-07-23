"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type CartContextValue = {
  itemCount: number;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const count = data.items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
    setItemCount(count);
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart }}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
