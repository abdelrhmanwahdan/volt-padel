"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { Lock } from "lucide-react";

const SHIPPING_FREE_OVER = 15000;
const FLAT_SHIPPING = 1200;

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const [submitting, setSubmitting] = useState(false);

  const shipping = subtotal === 0 ? 0 : subtotal >= SHIPPING_FREE_OVER ? 0 : FLAT_SHIPPING;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Generate a mock order id and route to success — cart is cleared in success page.
    const orderId = `VLT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setTimeout(() => router.push(`/checkout/success?order=${orderId}`), 600);
  };

  if (lines.length === 0) {
    return (
      <div className="pt-32 pb-32 px-6 max-w-2xl mx-auto text-center">
        <p className="text-eyebrow mb-3">Empty cart</p>
        <h1 className="text-display mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          Nothing to check out.
        </h1>
        <Link
          href="/product"
          className="inline-flex h-12 px-8 items-center rounded-full bg-accent text-bg font-semibold"
        >
          Shop the racket
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-6 lg:px-10">
      <p className="text-eyebrow mb-3">Checkout</p>
      <h1 className="text-display mb-12" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
        Almost charged.
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-10">
          {/* Contact */}
          <section>
            <h2 className="text-eyebrow mb-4">01 · Contact</h2>
            <Field label="Email" name="email" type="email" required autoComplete="email" />
          </section>

          {/* Shipping */}
          <section>
            <h2 className="text-eyebrow mb-4">02 · Shipping</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First name" name="first" required autoComplete="given-name" />
              <Field label="Last name" name="last" required autoComplete="family-name" />
              <Field
                className="sm:col-span-2"
                label="Address"
                name="address"
                required
                autoComplete="street-address"
              />
              <Field label="City" name="city" required autoComplete="address-level2" />
              <Field label="Postal code" name="zip" required autoComplete="postal-code" />
              <Field
                className="sm:col-span-2"
                label="Country"
                name="country"
                required
                defaultValue="Spain"
                autoComplete="country-name"
              />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="text-eyebrow mb-4">03 · Payment</h2>
            <p className="text-xs text-fg-muted flex items-center gap-2 mb-4">
              <Lock className="w-3 h-3" /> Secure · this is a demo — no charge is made
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px] gap-4">
              <Field
                label="Card number"
                name="card"
                required
                placeholder="4242 4242 4242 4242"
                autoComplete="cc-number"
              />
              <Field label="MM/YY" name="exp" required placeholder="12/29" autoComplete="cc-exp" />
              <Field label="CVC" name="cvc" required placeholder="123" autoComplete="cc-csc" />
              <Field
                className="sm:col-span-3"
                label="Name on card"
                name="cardName"
                required
                autoComplete="cc-name"
              />
            </div>
          </section>
        </div>

        {/* Order summary */}
        <aside className="rounded-2xl border border-border p-6 bg-bg-elev/30 h-fit lg:sticky lg:top-24">
          <p className="text-eyebrow mb-6">Order</p>
          <ul className="space-y-4 mb-6">
            {lines.map((l) => (
              <li key={l.sku} className="flex gap-3 items-center">
                <div className="w-14 h-14 relative rounded-lg overflow-hidden bg-bg border border-border shrink-0">
                  <Image
                    src="/hero/desktop/frame_0074.webp"
                    alt={`${l.name} thumbnail`}
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{l.name}</p>
                  <p className="text-xs text-fg-muted">
                    {l.variantColor} · Qty {l.qty}
                  </p>
                </div>
                <p className="text-sm font-mono tabular-nums">
                  {formatPrice(l.unitPrice * l.qty)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="space-y-3 text-sm border-t border-border pt-4">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
            <Row label="Tax (8%)" value={formatPrice(tax)} />
            <Row
              label="Total"
              value={formatPrice(total)}
              strong
              className="pt-3 mt-2 border-t border-border text-base"
            />
          </dl>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full h-12 rounded-full bg-accent text-bg font-semibold hover:bg-fg transition-colors disabled:opacity-50"
          >
            {submitting ? "Charging…" : `Pay ${formatPrice(total)}`}
          </button>
          <p className="mt-4 text-xs text-fg-faint text-center">
            By placing your order you agree to our{" "}
            <Link href="/legal/terms" className="underline underline-offset-2">
              Terms
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  className = "",
  ...props
}: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs text-fg-muted font-mono uppercase tracking-widest mb-1.5">
        {label}
      </span>
      <input
        {...props}
        className="w-full h-12 px-4 rounded-xl bg-bg border border-border focus:border-accent focus:outline-none text-fg placeholder:text-fg-faint transition-colors"
      />
    </label>
  );
}

function Row({
  label,
  value,
  strong,
  className = "",
}: {
  label: string;
  value: string;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-between ${className}`}>
      <dt className={strong ? "font-semibold" : "text-fg-muted"}>{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}
