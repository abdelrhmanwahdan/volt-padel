import { ArrowDown } from "lucide-react";
import ScrollScrubVideo from "./scroll-scrub-video";

export default function HeroVideo({
  src,
  poster,
  productName,
  tagline,
  className = "",
}: {
  src: string;
  poster?: string;
  productName: string;
  tagline: string;
  className?: string;
}) {
  return (
    <ScrollScrubVideo
      src={src}
      poster={poster}
      alt={`${productName} racket — electric strike reveal`}
      scrollHeight={250}
      className={className}
    >
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 30% 70%, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Off-axis title — broken left-aligned, anchored bottom-left, breaks the centered-hero AI template */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="self-end w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 md:pb-24">
          <div className="max-w-[18ch]">
            <p className="text-eyebrow mb-5 text-fg-muted">{tagline}</p>
            <h1
              className="text-display text-fg leading-[0.86]"
              style={{ fontSize: "clamp(4.5rem, 16vw, 14rem)" }}
            >
              {productName}
            </h1>
          </div>
        </div>
      </div>

      {/* Right-aligned hairline + scroll cue (off-axis, breaks symmetry) */}
      <div className="absolute right-6 lg:right-10 bottom-10 flex flex-col items-end gap-3 pointer-events-none text-fg-muted">
        <span className="text-eyebrow">Charged · 2026</span>
        <span className="inline-flex items-center gap-2 text-eyebrow">
          Scroll <ArrowDown className="w-3 h-3 animate-bounce" aria-hidden />
        </span>
      </div>
    </ScrollScrubVideo>
  );
}
