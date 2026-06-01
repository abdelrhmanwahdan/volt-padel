import Image from "next/image";
import Link from "next/link";
import { PRODUCT } from "@/lib/product";

export const metadata = {
  title: "Technology — How the Pro 3K is built",
  description:
    "Inside the VÖLT Pro 3K: a five-layer composite — 3K carbon twill face, fiberglass diffusion layer, EVA honeycomb core, inner carbon mirror, and a cold-forged 6061 aluminum rim. Pressure-cured for 8 hours in Stockholm.",
  openGraph: {
    title: "VÖLT Technology — Five layers, one charged response",
    description:
      "How the Pro 3K transfers 14% more energy without ringing the wrist.",
    images: ["/posters/hero.webp"],
  },
};

const LAYERS = [
  {
    n: "01",
    title: "3K Carbon Twill Face",
    body:
      "Three-strand carbon yarn woven at high density. Snaps back faster than 12K weaves, transferring 14% more energy into the ball without ringing the wrist.",
  },
  {
    n: "02",
    title: "Fiberglass Diffusion Layer",
    body:
      "A 0.4 mm fiberglass cap diffuses impact across the entire face. The sweet spot grows; off-center hits stop punishing.",
  },
  {
    n: "03",
    title: "EVA Honeycomb Core",
    body:
      "Soft black EVA in a hex cell structure. Absorbs the brunt of impact and gives it back on the rebound — the racket that holds energy until you ask for it.",
  },
  {
    n: "04",
    title: "Inner Carbon Mirror",
    body:
      "A symmetrical 3K layer on the inner face balances the bend curve. Both sides of the racket play identically — no dead side.",
  },
  {
    n: "05",
    title: "Cold-Forged 6061 Rim",
    body:
      "Anodized aluminum frame survives 50,000+ cage impacts in lab testing. Holds its geometry season after season.",
  },
];

export default function TechnologyPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="px-6 lg:px-10 py-24 max-w-[1400px] mx-auto">
        <p className="text-eyebrow mb-4">Technology</p>
        <h1
          className="text-display text-fg max-w-[16ch] mb-6"
          style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
        >
          Five layers. One charged response.
        </h1>
        <p className="text-fg-muted text-lg max-w-[52ch] leading-relaxed">
          Every VÖLT Pro 3K is the same five-layer architecture, built in our Stockholm
          workshop and pressure-cured for 8 hours. The materials change how the racket
          feels. The order they're laid in changes how it plays.
        </p>
      </section>

      {/* Layer stack */}
      <section className="px-6 lg:px-10 py-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start aspect-[3/4] rounded-2xl bg-bg-elev border border-border overflow-hidden relative">
            <Image
              src="/product/racket_front.webp"
              alt="VÖLT Pro 3K"
              fill
              className="object-contain p-4 md:p-8"
              sizes="(min-width: 1024px) 560px, 100vw"
            />
          </div>
          <ol className="space-y-12">
            {LAYERS.map((l) => (
              <li key={l.n} className="grid grid-cols-[auto_1fr] gap-6">
                <span className="font-mono text-accent text-3xl tabular-nums leading-none">
                  {l.n}
                </span>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{l.title}</h3>
                  <p className="text-fg-muted leading-relaxed">{l.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Numbers strip */}
      <section className="border-y border-border bg-bg-elev/30 mt-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat n="370g" label="Frame weight" />
          <Stat n="50k" label="Cage hits before failure" />
          <Stat n="8h" label="Cure time per racket" />
          <Stat n="14%" label="More energy returned" />
        </div>
      </section>

      {/* Specs */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <p className="text-eyebrow mb-6">Full specifications</p>
        <dl className="border-t border-border divide-y divide-border">
          {PRODUCT.specs.map((s) => (
            <div key={s.label} className="py-4 grid grid-cols-2 gap-6">
              <dt className="text-fg-muted">{s.label}</dt>
              <dd className="text-fg font-mono tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="text-center py-24 px-6">
        <Link
          href="/product"
          className="inline-flex h-14 px-10 items-center rounded-full bg-accent text-bg font-semibold text-lg hover:bg-fg transition-colors"
        >
          Buy the Pro 3K
        </Link>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p
        className="text-display text-accent"
        style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
      >
        {n}
      </p>
      <p className="text-eyebrow mt-3">{label}</p>
    </div>
  );
}
