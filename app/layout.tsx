import type { Metadata } from "next";
import { PT_Serif, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/components/CartProvider";

// next/font самостоятельно инлайнит @font-face и хостит шрифты локально —
// это устраняет лишний внешний запрос и предотвращает сдвиг макета (CLS)
// при подгрузке веб-шрифтов, что напрямую влияет на Core Web Vitals.
// PT Serif выбран как display-шрифт вместо более "модных" вариантов
// (Fraunces, Playfair) потому что у них нет кириллического начертания —
// а контент магазина на русском.
const display = PT_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NextShop — предметы для дома",
    template: "%s — NextShop",
  },
  description:
    "Мебель, свет, текстиль и керамика для дома. Мануфактурное производство, доставка по России.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "NextShop",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-paper font-body text-ink antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
