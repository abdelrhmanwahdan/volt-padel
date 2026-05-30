import Link from "next/link";
import ProductConfig from "@/components/product-config";
import ProductGallery from "@/components/product-gallery";
import StickyBuy from "@/components/sticky-buy";
import { PRODUCT } from "@/lib/product";

export const metadata = { title: "Pro 3K — The Charged Padel Racket" };

export default function ProductPage() {
  return (
    <div className="pt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 py-10 lg:py-16">
        <ProductGallery name={PRODUCT.name} />
        <div id="configure">
          <ProductConfig />
        </div>
      </div>

      {/* Specs */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-1">
            <p className="text-eyebrow mb-4">Specifications</p>
            <h2 className="text-display text-fg" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Built on numbers.
            </h2>
          </div>
          <dl className="lg:col-span-2 divide-y divide-border">
            {PRODUCT.specs.map((s) => (
              <div key={s.label} className="py-4 grid grid-cols-2 gap-6">
                <dt className="text-fg-muted text-sm">{s.label}</dt>
                <dd className="text-fg font-mono text-sm tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 border-t border-border">
        <p className="text-eyebrow mb-6">Why VÖLT</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {PRODUCT.features.map((f) => (
            <div key={f.title}>
              <h3 className="text-xl font-semibold text-fg mb-2">{f.title}</h3>
              <p className="text-fg-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/technology"
            className="text-accent text-sm hover:underline underline-offset-4"
          >
            Deep dive into the technology →
          </Link>
        </div>
      </section>

      <StickyBuy />
    </div>
  );
}
