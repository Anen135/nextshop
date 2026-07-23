import type { Metadata } from "next";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Furniture, lighting, textiles, and ceramics for the home — NextShop catalog.",
};

export const revalidate = 300;

const categories = [
  { name: "All Products", slug: undefined },
  { name: "Furniture", slug: "furniture" },
  { name: "Lighting", slug: "lighting" },
  { name: "Textiles", slug: "textile" },
  { name: "Ceramics", slug: "ceramics" },
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
        <p className="eyebrow mb-3">Catalog</p>
        <h1 className="font-display text-4xl leading-tight text-ink">
          Pieces made to last for decades
        </h1>
      </section>

      <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-6" aria-label="Filter by category">
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
        <p className="text-ink/60">No products in this category yet.</p>
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
