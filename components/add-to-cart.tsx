"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { PRODUCT, type Variant } from "@/lib/product";
import { ShoppingBag, Check } from "lucide-react";

export default function AddToCart({ variant, qty }: { variant: Variant; qty: number }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleAdd = (goToCart: boolean) => {
    if (!variant.inStock) return;
    add({
      sku: variant.sku,
      name: `${PRODUCT.name} — ${variant.color}`,
      variantColor: variant.color,
      variantHex: variant.hex,
      unitPrice: PRODUCT.price,
      qty,
    });
    setAdded(true);
    if (goToCart) router.push("/cart");
    else setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleAdd(false)}
          disabled={!variant.inStock}
          className="h-14 px-6 rounded-full border border-border-strong text-fg font-semibold hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {added ? (
            <>
              <Check className="w-4 h-4" aria-hidden /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" aria-hidden /> Add to cart
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleAdd(true)}
          disabled={!variant.inStock}
          className="h-14 px-6 rounded-full bg-accent text-bg font-semibold hover:bg-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {variant.inStock ? "Buy now" : "Out of stock"}
        </button>
      </div>
      {/* Screen-reader announcement when cart updates */}
      <p role="status" aria-live="polite" className="sr-only">
        {added ? `Added ${variant.color} VÖLT Pro 3K (${qty}) to cart.` : ""}
      </p>
    </>
  );
}
