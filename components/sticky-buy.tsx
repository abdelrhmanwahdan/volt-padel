"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PRODUCT } from "@/lib/product";
import { formatPrice } from "@/lib/utils";

export default function StickyBuy() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-bg/85 backdrop-blur-xl border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-eyebrow truncate">{PRODUCT.name}</p>
            <p className="font-mono text-fg tabular-nums">{formatPrice(PRODUCT.price)}</p>
          </div>
          <Link
            href="/cart"
            className="hidden sm:inline-flex h-11 px-5 items-center rounded-full border border-border-strong hover:border-accent hover:text-accent transition-colors text-sm"
          >
            View cart
          </Link>
          <a
            href="#configure"
            className="h-11 px-6 inline-flex items-center rounded-full bg-accent text-bg font-semibold text-sm hover:bg-fg transition-colors"
          >
            Configure
          </a>
        </div>
      </div>
    </div>
  );
}
