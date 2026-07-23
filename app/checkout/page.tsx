"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Не удалось оформить заказ. Проверьте поля формы.");
        return;
      }

      router.push(`/checkout/success?order=${data.orderNumber}`);
    });
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="font-display text-3xl mb-8">Оформление заказа</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        <Field label="Имя" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Field label="Телефон" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field label="Адрес доставки" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />

        {error && <p className="text-sm text-clay">{error}</p>}

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? "Оформляем…" : "Оплатить заказ"}
        </button>

        <p className="text-xs text-ink/50">
          Демо-режим: оплата подтверждается автоматически, заказ синхронизируется с CRM.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink/60">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink/40"
      />
    </label>
  );
}
