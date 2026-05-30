"use client";
import { useState } from "react";
import { PRODUCT, type Variant } from "@/lib/product";
import { formatPrice, cn } from "@/lib/utils";
import AddToCart from "./add-to-cart";
import { Minus, Plus } from "lucide-react";

export default function ProductConfig() {
  const [variant, setVariant] = useState<Variant>(PRODUCT.variants[0]);
  const [qty, setQty] = useState(1);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-eyebrow mb-3">{PRODUCT.id.toUpperCase()}</p>
        <h1
          className="text-display text-fg mb-2"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          {PRODUCT.name}
        </h1>
        <p className="text-fg-muted text-lg">{PRODUCT.tagline}</p>
      </div>

      <div className="flex items-baseline gap-3">
        <p className="font-mono text-3xl text-fg tabular-nums">
          {formatPrice(PRODUCT.price)}
        </p>
        <p className="text-xs text-fg-faint font-mono">USD · incl. taxes</p>
      </div>

      <p className="text-fg-muted leading-relaxed max-w-[42ch]">{PRODUCT.description}</p>

      {/* Colorway */}
      <div className="space-y-3">
        <p className="text-eyebrow">Colorway · {variant.color}</p>
        <div className="flex gap-3">
          {PRODUCT.variants.map((v) => (
            <button
              key={v.sku}
              type="button"
              onClick={() => v.inStock && setVariant(v)}
              aria-label={v.color}
              disabled={!v.inStock}
              className={cn(
                "relative h-12 w-12 rounded-full border-2 transition-all",
                variant.sku === v.sku ? "border-accent scale-110" : "border-border",
                !v.inStock && "opacity-30 cursor-not-allowed",
              )}
              style={{ background: v.hex }}
            >
              {!v.inStock && (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono tracking-widest text-fg">
                  SOLD
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-3">
        <p className="text-eyebrow">Quantity</p>
        <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-12 w-12 flex items-center justify-center hover:bg-bg-elev transition-colors"
            aria-label="Decrease"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-14 text-center font-mono tabular-nums text-lg">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="h-12 w-12 flex items-center justify-center hover:bg-bg-elev transition-colors"
            aria-label="Increase"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AddToCart variant={variant} qty={qty} />

      <ul className="space-y-2 text-sm text-fg-muted pt-4 border-t border-border">
        <li>· Free shipping on all orders</li>
        <li>· 30-day no-question return window</li>
        <li>· 2-year structural warranty on the frame</li>
      </ul>
    </div>
  );
}
