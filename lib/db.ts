import { PrismaClient } from "@prisma/client";

// Стандартный паттерн для Next.js: в dev-режиме модуль переимпортируется
// при каждом hot-reload, поэтому кэшируем клиент в globalThis, чтобы не
// открывать новый пул соединений с PostgreSQL при каждом запросе.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
