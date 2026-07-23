import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products?category=lighting&q=лампа
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const products = await db.product.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}
