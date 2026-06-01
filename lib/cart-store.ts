"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  sku: string;
  name: string;
  variantColor: string;
  variantHex: string;
  unitPrice: number;
  qty: number;
  image?: string;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.sku === line.sku);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.sku === line.sku ? { ...l, qty: l.qty + (line.qty ?? 1) } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, qty: line.qty ?? 1 }] };
        }),
      remove: (sku) => set((state) => ({ lines: state.lines.filter((l) => l.sku !== sku) })),
      setQty: (sku, qty) =>
        set((state) => ({
          lines: qty <= 0
            ? state.lines.filter((l) => l.sku !== sku)
            : state.lines.map((l) => (l.sku === sku ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [] }),
      totalItems: () => get().lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0),
    }),
    { name: "volt-cart" },
  ),
);

/**
 * Returns `true` only after Zustand has rehydrated from localStorage. Use this
 * to gate any UI that depends on persisted cart state so SSR (empty cart) and
 * post-hydration client (real cart) don't disagree.
 */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useCart.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useCart.persist.onFinishHydration(() => setHydrated(true));
    return () => unsub();
  }, []);
  return hydrated;
}
