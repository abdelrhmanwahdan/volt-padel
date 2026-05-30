import { PRODUCT } from "@/lib/product";

const PICKS: { label: string; value: string }[] = [
  { label: "Weight", value: "370g" },
  { label: "Shape", value: "Teardrop" },
  { label: "Core", value: "EVA Hex" },
  { label: "Face", value: "3K Carbon" },
  { label: "Warranty", value: "2 yrs" },
];

export default function SpecsStrip() {
  return (
    <section className="border-y border-border bg-bg-elev/30">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        {PICKS.map((s) => (
          <div key={s.label}>
            <p className="text-eyebrow mb-2">{s.label}</p>
            <p
              className="text-display text-fg"
              style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.4rem)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>
      <p className="sr-only">{PRODUCT.tagline}</p>
    </section>
  );
}
