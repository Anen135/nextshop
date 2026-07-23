import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Мебель", slug: "furniture" },
  { name: "Свет", slug: "lighting" },
  { name: "Текстиль", slug: "textile" },
  { name: "Керамика", slug: "ceramics" },
];

const products = [
  {
    slug: "kreslo-arka",
    title: "Кресло «Арка»",
    description:
      "Дубовый каркас, ручная обивка льном. Спроектировано для небольших гостиных — компактный силуэт, глубокая посадка.",
    priceCents: 4990000,
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800",
    stock: 6,
    categorySlug: "furniture",
  },
  {
    slug: "stol-obedenny-riga",
    title: "Обеденный стол «Рига»",
    description: "Массив ясеня, столешница 180×90 см. Выдерживает до 8 персон.",
    priceCents: 8990000,
    imageUrl: "https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=800",
    stock: 3,
    categorySlug: "furniture",
  },
  {
    slug: "svetilnik-podvesnoy-luna",
    title: "Подвесной светильник «Луна»",
    description: "Матовое стекло ручной выдувки, диммируемый LED-модуль 2700K.",
    priceCents: 1290000,
    imageUrl: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800",
    stock: 15,
    categorySlug: "lighting",
  },
  {
    slug: "torsher-flor",
    title: "Торшер «Флор»",
    description: "Латунная стойка, регулируемый угол наклона абажура.",
    priceCents: 990000,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
    stock: 9,
    categorySlug: "lighting",
  },
  {
    slug: "pled-shersyanoy-nord",
    title: "Плед шерстяной «Норд»",
    description: "100% мериносовая шерсть, 130×180 см, плотное плетение.",
    priceCents: 450000,
    imageUrl: "https://images.unsplash.com/photo-1580301762395-83cd1300ba3d?w=800",
    stock: 40,
    categorySlug: "textile",
  },
  {
    slug: "podushka-lnyanaya-ovs",
    title: "Льняная подушка «Овёс»",
    description: "Чехол из умягчённого льна, наполнитель — гречневая лузга.",
    priceCents: 210000,
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
    stock: 32,
    categorySlug: "textile",
  },
  {
    slug: "vaza-keramicheskaya-dyuna",
    title: "Ваза керамическая «Дюна»",
    description: "Ручная работа, глазурь песочного оттенка, высота 28 см.",
    priceCents: 380000,
    imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800",
    stock: 12,
    categorySlug: "ceramics",
  },
  {
    slug: "nabor-chashek-shtrikh",
    title: "Набор чашек «Штрих»",
    description: "4 чашки по 250 мл, подглазурная роспись.",
    priceCents: 320000,
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800",
    stock: 18,
    categorySlug: "ceramics",
  },
];

async function main() {
  console.log("Сидируем базу…");

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

  console.log(`Готово: ${categories.length} категорий, ${products.length} товаров.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
