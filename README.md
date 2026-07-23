# NextShop — интернет-магазин

E-commerce на Next.js 14 (App Router) + PostgreSQL (Prisma). Каталог товаров, корзина, оформление заказа, интеграция с платежами (Stripe) и CRM.

Платежи и CRM работают в mock-режиме по умолчанию — весь флоу полностью рабочий без внешних ключей. Реальные ключи подключаются переменными окружения.

## Стек

- **Next.js 14** — App Router, Server Components для каталога, Client Components для интерактива
- **PostgreSQL + Prisma** — реляционная модель, типобезопасные запросы
- **Stripe** — платёжный провайдер (через обёртку `lib/payment.ts`)
- **CRM** — amoCRM-совместимый клиент (через `lib/crm.ts`)
- **Tailwind CSS** — стилизация

## Запуск

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Структура

```
app/
  page.tsx                 — каталог (ISR 5 мин)
  products/[slug]/page.tsx — карточка товара
  cart/page.tsx            — корзина
  checkout/page.tsx        — оформление заказа
  api/
    products/route.ts      — фильтрация каталога
    cart/route.ts          — корзина по cookie-сессии
    checkout/route.ts      — заказ + платёж + CRM
    webhooks/stripe/route.ts — подтверждение оплаты
lib/
  db.ts       — Prisma-клиент
  cart.ts     — гостевая корзина
  payment.ts  — Stripe-обёртка с mock-режимом
  crm.ts      — CRM-клиент (amoCRM / mock)
  types.ts    — форматирование денег
prisma/
  schema.prisma
  seed.ts
components/
  Header.tsx, ProductCard.tsx, AddToCartButton.tsx, CartProvider.tsx