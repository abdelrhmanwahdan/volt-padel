"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

const SHIPPING_FREE_OVER = 15000;
const FLAT_SHIPPING = 1200;

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  const shipping = subtotal === 0 ? 0 : subtotal >= SHIPPING_FREE_OVER ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <div className="pt-32 pb-32 px-6 max-w-2xl mx-auto text-center">
        <ShoppingBag className="w-12 h-12 mx-auto text-fg-faint mb-6" strokeWidth={1} />
        <p className="text-eyebrow mb-3">Your cart is empty</p>
        <h1
          className="text-display text-fg mb-6"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
        >
          Nothing here yet.
        </h1>
        <p className="text-fg-muted mb-10 max-w-md mx-auto">
          The Pro 3K is waiting. One racket, one decision.
        </p>
        <Link
          href="/product"
          className="inline-flex h-12 px-8 items-center rounded-full bg-accent text-bg font-semibold hover:bg-fg transition-colors"
        >
          Configure your racket
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-6 lg:px-10">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-eyebrow mb-3">Cart</p>
          <h1 className="text-display" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
            {lines.length === 1 ? "1 item" : `${lines.length} items`}
          </h1>
        </div>
        <Link
          href="/product"
          className="hidden sm:inline text-sm text-fg-muted hover:text-fg transition-colors"
        >
          ← Continue shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
        {/* Lines */}
        <ul className="divide-y divide-border border-t border-b border-border">
          {lines.map((line) => (
            <li key={line.sku} className="py-6 grid grid-cols-[80px_1fr_auto] gap-4 items-center">
              <div className="aspect-square relative rounded-xl bg-bg-elev overflow-hidden border border-border">
                <Image
                  src="/hero/desktop/frame_0074.webp"
                  alt={`${line.name} thumbnail`}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-fg truncate">{line.name}</p>
                <p className="text-sm text-fg-muted flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full border border-border"
                    style={{ background: line.variantHex }}
                  />
                  {line.variantColor} · SKU {line.sku}
                </p>
                <div className="mt-3 inline-flex items-center border border-border rounded-full overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => setQty(line.sku, line.qty - 1)}
                    className="h-9 w-9 flex items-center justify-center hover:bg-bg-elev"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-mono tabular-nums">{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(line.sku, line.qty + 1)}
                    className="h-9 w-9 flex items-center justify-center hover:bg-bg-elev"
                    aria-label="Increase"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono tabular-nums text-fg">
                  {formatPrice(line.unitPrice * line.qty)}
                </p>
                <button
                  type="button"
                  onClick={() => remove(line.sku)}
                  className="mt-2 text-fg-faint hover:text-fg text-xs inline-flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="rounded-2xl border border-border p-6 bg-bg-elev/30 h-fit lg:sticky lg:top-24">
          <p className="text-eyebrow mb-6">Summary</p>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">Subtotal</dt>
              <dd className="font-mono tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">Shipping</dt>
              <dd className="font-mono tabular-nums">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t border-border text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-mono tabular-nums text-fg">{formatPrice(total)}</dd>
            </div>
          </dl>
          {shipping > 0 && (
            <p className="mt-4 text-xs text-fg-faint">
              Add {formatPrice(SHIPPING_FREE_OVER - subtotal)} to qualify for free shipping.
            </p>
          )}
          <Link
            href="/checkout"
            className="mt-6 flex items-center justify-center h-12 rounded-full bg-accent text-bg font-semibold hover:bg-fg transition-colors"
          >
            Checkout
          </Link>
          <p className="mt-4 text-xs text-fg-faint text-center">
            Taxes calculated at checkout
          </p>
        </aside>
      </div>
    </div>
  );
}
