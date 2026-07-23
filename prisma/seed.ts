import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Furniture", slug: "furniture" },
  { name: "Lighting", slug: "lighting" },
  { name: "Textiles", slug: "textile" },
  { name: "Ceramics", slug: "ceramics" },
];

const products = [
  {
    slug: "kreslo-arka",
    title: "Arka Armchair",
    description:
      "Oak frame, hand-upholstered with linen. Designed for small living rooms — compact silhouette, deep seating.",
    priceCents: 4990000,
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800",
    stock: 6,
    categorySlug: "furniture",
  },
  {
    slug: "stol-obedenny-riga",
    title: "Riga Dining Table",
    description: "Solid ash wood, tabletop 180×90 cm. Seats up to 8 people.",
    priceCents: 8990000,
    imageUrl: "https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=800",
    stock: 3,
    categorySlug: "furniture",
  },
  {
    slug: "svetilnik-podvesnoy-luna",
    title: "Luna Pendant Light",
    description: "Hand-blown frosted glass, dimmable LED module 2700K.",
    priceCents: 1290000,
    imageUrl: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800",
    stock: 15,
    categorySlug: "lighting",
  },
  {
    slug: "torsher-flor",
    title: "Flor Floor Lamp",
    description: "Brass stand, adjustable lampshade angle.",
    priceCents: 990000,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
    stock: 9,
    categorySlug: "lighting",
  },
  {
    slug: "pled-shersyanoy-nord",
    title: "Nord Wool Blanket",
    description: "100% merino wool, 130×180 cm, dense weave.",
    priceCents: 450000,
    imageUrl: "https://images.unsplash.com/photo-1580301762395-83cd1300ba3d?w=800",
    stock: 40,
    categorySlug: "textile",
  },
  {
    slug: "podushka-lnyanaya-ovs",
    title: "Oats Linen Pillow",
    description: "Softened linen cover, buckwheat hull filling.",
    priceCents: 210000,
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
    stock: 32,
    categorySlug: "textile",
  },
  {
    slug: "vaza-keramicheskaya-dyuna",
    title: "Duna Ceramic Vase",
    description: "Handmade, sand-toned glaze, height 28 cm.",
    priceCents: 380000,
    imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800",
    stock: 12,
    categorySlug: "ceramics",
  },
  {
    slug: "nabor-chashek-shtrikh",
    title: "Shtrikh Cup Set",
    description: "4 cups of 250 ml each, underglaze painting.",
    priceCents: 320000,
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800",
    stock: 18,
    categorySlug: "ceramics",
  },
];

async function main() {
  console.log("Seeding database…");

  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categoryMap.set(c.slug, created.id);
  }

  for (const p of products) {
    const { categorySlug, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...rest,
        categoryId: categoryMap.get(categorySlug)!,
      },
    });
  }

  console.log(`Done: ${categories.length} categories, ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
