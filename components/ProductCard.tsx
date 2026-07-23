import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/types";

type Props = {
  product: {
    slug: string;
    title: string;
    priceCents: number;
    currency: string;
    imageUrl: string;
  };
  priority?: boolean;
};

export default function ProductCard({ product, priority }: Props) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-line">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm text-ink">{product.title}</h3>
        <p className="text-sm text-ink/60">
          {formatMoney({ amountCents: product.priceCents, currency: product.currency })}
        </p>
      </div>
    </Link>
  );
}
