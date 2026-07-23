import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";

export const revalidate = 300;

type Props = { params: { slug: string } };

async function getProduct(slug: string) {
  return db.product.findUnique({ where: { slug }, include: { category: true } });
}

// generateStaticParams позволяет пререндерить карточки товаров в билд-тайме —
// пользователи получают их как статику, ускоряя LCP и снимая нагрузку с БД.
export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.imageUrl }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  // JSON-LD Product — даёт поисковикам структурированные данные о цене и
  // наличии, что открывает путь к rich snippets в выдаче Google/Яндекс.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.imageUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-line">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="max-w-md">
          <p className="eyebrow mb-3">{product.category.name}</p>
          <h1 className="font-display text-3xl leading-tight text-ink">{product.title}</h1>
          <p className="mt-4 text-lg text-ink/80">
            {formatMoney({ amountCents: product.priceCents, currency: product.currency })}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-ink/70">{product.description}</p>

          <div className="mt-8">
            <AddToCartButton productId={product.id} inStock={product.stock > 0} />
            <p className="mt-3 text-xs text-ink/50">
              {product.stock > 0 ? `В наличии: ${product.stock} шт.` : "Ожидается пополнение"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
