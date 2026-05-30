import Link from "next/link";
import HeroVideo from "@/components/hero-video";
import ScrollCanvas from "@/components/scroll-canvas";
import ChapterVideo from "@/components/chapter-video";
import SpecsStrip from "@/components/specs-strip";
import { PRODUCT } from "@/lib/product";
import { formatPrice, mediaUrl } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const CHAPTERS = [
  {
    eyebrow: "01 · Carbon Face",
    title: "3K twill weave",
    body:
      "Tighter weave, snappier response. Wrist intent translates into shot direction without ringing.",
  },
  {
    eyebrow: "02 · Hex Hole Grid",
    title: "Cut drag, not power",
    body:
      "Hexagonal hole pattern displaces air evenly across the face. Faster swings, quieter strikes.",
  },
  {
    eyebrow: "03 · EVA Core",
    title: "Soft. Alive. Forgiving.",
    body:
      "Honeycomb EVA absorbs the brunt and gives it back. Bandeja becomes muscle memory.",
  },
  {
    eyebrow: "04 · Cold-Forged Frame",
    title: "Holds its geometry",
    body:
      "Anodized aluminum 6061 shrugs off cage hits and stays true across an entire season.",
  },
];

export default function Home() {
  return (
    <>
      {/* CHAPTER 1 — HERO (electric strike, plays once) */}
      <HeroVideo
        src={mediaUrl("/videos/hero.mp4")}
        poster="/posters/hero.webp"
        productName="VÖLT"
        tagline="Charged · Pro 3K · 2026"
      />

      {/* CHAPTER 2 — STATEMENT */}
      <section className="py-32 md:py-44 px-6 lg:px-10 max-w-[1100px] mx-auto text-center">
        <p className="text-eyebrow mb-6">The racket</p>
        <h2
          className="text-display text-fg"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6.5rem)" }}
        >
          One racket that holds&nbsp;energy{" "}
          <span className="text-accent">until you ask&nbsp;for&nbsp;it.</span>
        </h2>
        <p className="mt-8 text-fg-muted text-lg max-w-[52ch] mx-auto leading-relaxed">
          {PRODUCT.description}
        </p>
      </section>

      {/* CHAPTER 3 — SCROLL TURNTABLE (vid2 → 148 transparent webp frames) */}
      <ScrollCanvas chapters={CHAPTERS} />

      {/* CHAPTER 4 — CHARGE (vid3, scroll-scrubbed) */}
      <ChapterVideo
        src={mediaUrl("/videos/charge.mp4")}
        poster="/posters/charge.webp"
        eyebrow="Engineered · Charged"
        title="It wakes up the moment you do."
        body="The hex grid lights up under load. The EVA core stores recoil. The carbon snaps it back where you point. A racket that's never asleep."
        align="bottom-left"
        scrollHeight={300}
        vignette={0.55}
      />

      {/* CHAPTER 5 — IMPACT (vid4 trimmed to 3s ball-departure, scroll-scrubbed) */}
      <ChapterVideo
        src={mediaUrl("/videos/impact.mp4")}
        poster="/posters/impact.webp"
        eyebrow="Impact · Sweet Spot"
        title="The strike that sounds right."
        body="A sweet spot that travels with you across the face. Off-center hits don't punish — they instruct."
        align="bottom-right"
        scrollHeight={220}
        vignette={0.5}
      />

      {/* CHAPTER 6 — SPECS STRIP */}
      <SpecsStrip />

      {/* CHAPTER 7 — CTA */}
      <section className="relative py-40 md:py-56 px-6 text-center overflow-hidden">
        {/* Soft radial accent glow — atmosphere without slicing through text */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] max-w-[1400px] aspect-square rounded-full opacity-[0.07]"
            style={{
              background:
                "radial-gradient(circle, var(--color-accent) 0%, transparent 60%)",
            }}
          />
        </div>

        <p className="text-eyebrow mb-8">Available now · Pre-order</p>
        <h2
          className="text-display text-fg mb-12 max-w-[18ch] mx-auto"
          style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
        >
          Buy the {PRODUCT.name}
        </h2>

        {/* Deliberate accent divider — bracket between headline and details */}
        <div
          className="flex items-center justify-center gap-4 mb-12"
          aria-hidden
        >
          <span
            className="h-px w-16 bg-accent"
            style={{ boxShadow: "0 0 12px 0 var(--color-accent)" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent"
            style={{ boxShadow: "0 0 12px 2px var(--color-accent)" }}
          />
          <span
            className="h-px w-16 bg-accent"
            style={{ boxShadow: "0 0 12px 0 var(--color-accent)" }}
          />
        </div>

        <p className="text-fg-muted text-lg mb-14">
          {formatPrice(PRODUCT.price)} · Free shipping · 30-day return window
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/product"
            className="h-14 px-10 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-bg font-semibold text-lg hover:bg-fg transition-colors group"
          >
            Configure & Buy
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/technology"
            className="h-14 px-10 inline-flex items-center justify-center rounded-full border border-border-strong hover:border-accent hover:text-accent transition-colors"
          >
            See the engineering
          </Link>
        </div>
      </section>
    </>
  );
}
