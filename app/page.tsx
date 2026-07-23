import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Мебель, свет, текстиль и керамика для дома — каталог NextShop.",
};

export const revalidate = 300;

const categories = [
  { name: "Все товары", slug: undefined },
  { name: "Мебель", slug: "furniture" },
  { name: "Свет", slug: "lighting" },
  { name: "Текстиль", slug: "textile" },
  { name: "Керамика", slug: "ceramics" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const activeCategory = searchParams.category;

  const products = await db.product.findMany({
    where: activeCategory ? { category: { slug: activeCategory } } : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <section className="mb-12 max-w-xl">
        <p className="eyebrow mb-3">Каталог</p>
        <h1 className="font-display text-4xl leading-tight text-ink">
          Предметы, сделанные, чтобы служить десятилетиями
        </h1>
      </section>

      <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-6" aria-label="Фильтр по категориям">
        {categories.map((c) => {
          const isActive = c.slug === activeCategory || (!c.slug && !activeCategory);
          return (
            <a
              key={c.name}
              href={c.slug ? `/?category=${c.slug}` : "/"}
              className={`text-sm ${isActive ? "font-medium text-ink" : "text-ink/50 hover:text-ink"}`}
            >
              {c.name}
            </a>
          );
        })}
      </nav>

      {products.length === 0 ? (
        <p className="text-ink/60">В этой категории пока нет товаров.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
