# NextShop — E-commerce Store

E-commerce on Next.js 14 (App Router) + PostgreSQL (Prisma). Product catalog, shopping cart, checkout, payment integration (Stripe) and CRM.

Payments and CRM work in mock mode by default — the entire flow is fully functional without external keys. Real keys can be connected via environment variables.

## Stack

- **Next.js 14** — App Router, Server Components for catalog, Client Components for interactivity
- **PostgreSQL + Prisma** — relational model, type-safe queries
- **Stripe** — payment provider (via `lib/payment.ts` wrapper)
- **CRM** — amoCRM-compatible client (via `lib/crm.ts`)
- **Tailwind CSS** — styling

## Getting Started

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Structure

```
app/
  page.tsx                 — catalog (ISR 5 min)
  products/[slug]/page.tsx — product page
  cart/page.tsx            — cart
  checkout/page.tsx        — checkout
  api/
    products/route.ts      — catalog filtering
    cart/route.ts          — cart via cookie session
    checkout/route.ts      — order + payment + CRM
    webhooks/stripe/route.ts — payment confirmation
lib/
  db.ts       — Prisma client
  cart.ts     — guest cart
  payment.ts  — Stripe wrapper with mock mode
  crm.ts      — CRM client (amoCRM / mock)
  types.ts    — money formatting
prisma/
  schema.prisma
  seed.ts
components/
  Header.tsx, ProductCard.tsx, AddToCartButton.tsx, CartProvider.tsx