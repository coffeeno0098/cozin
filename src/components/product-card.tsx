import { Box } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    gameMap: string;
    description: string | null;
    pricePoints: number;
    availableCodes: number;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const isInStock = product.availableCodes > 0;

  return (
    <article className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{product.gameMap}</p>
          <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
        </div>
        <div className="rounded-md bg-secondary px-3 py-2 text-right">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="font-semibold">{product.pricePoints} Point</p>
        </div>
      </div>

      {product.description ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{product.description}</p>
      ) : null}

      <div className="mt-5">
        <div className="rounded-md border p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Box className="size-4" />
            Stock
          </div>
          <p className="mt-2 text-2xl font-semibold">{product.availableCodes}</p>
        </div>
      </div>

      <Button className="mt-5 w-full" variant={isInStock ? "default" : "outline"} asChild>
        <Link href={`/products/${product.slug}`}>{isInStock ? "View product" : "View details"}</Link>
      </Button>
    </article>
  );
}
