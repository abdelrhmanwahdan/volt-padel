"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FRAMES = [
  { file: "racket_front", label: "Front profile" },
  { file: "racket_angle", label: "Three-quarter angle" },
];

export default function ProductGallery({ name }: { name: string }) {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const total = FRAMES.length;

  const scrollToIndex = useCallback((i: number) => {
    const scroller = scrollerRef.current;
    const slide = slideRefs.current[i];
    if (!scroller || !slide) return;
    scroller.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  }, []);

  const go = useCallback(
    (dir: number) => {
      const next = (active + dir + total) % total;
      scrollToIndex(next);
    },
    [active, total, scrollToIndex],
  );

  // Track which slide is in view via IntersectionObserver
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const i = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(i)) setActive(i);
          }
        });
      },
      { root: scroller, threshold: [0.6, 0.9] },
    );
    slideRefs.current.forEach((s) => s && obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Keyboard nav when stage has focus
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    scroller.addEventListener("keydown", onKey);
    return () => scroller.removeEventListener("keydown", onKey);
  }, [go]);

  // Mouse drag-to-scroll on desktop. Native touch scroll handles mobile already.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let moved = 0;
    let pointerId = -1;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // touch already snaps natively
      down = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
      moved = 0;
      scroller.style.cursor = "grabbing";
      scroller.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.abs(dx);
      scroller.scrollLeft = startScroll - dx;
    };
    const finish = () => {
      if (!down) return;
      down = false;
      scroller.style.cursor = "";
      scroller.style.scrollSnapType = "";
      // Snap to nearest slide based on current scroll position
      const slides = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      if (slides.length) {
        const w = slides[0].offsetWidth;
        const idx = Math.round(scroller.scrollLeft / w);
        const clamped = Math.max(0, Math.min(slides.length - 1, idx));
        scroller.scrollTo({
          left: slides[clamped].offsetLeft,
          behavior: "smooth",
        });
      }
    };
    const onClickCapture = (e: MouseEvent) => {
      // Suppress accidental clicks at the end of a drag
      if (moved > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    scroller.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    scroller.addEventListener("click", onClickCapture, true);

    return () => {
      scroller.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
      scroller.removeEventListener("click", onClickCapture, true);
      void pointerId;
    };
  }, []);

  return (
    <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      {/* Main stage — native horizontal scroll-snap carousel + mouse drag */}
      <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-bg-elev to-bg border border-border">
        <div
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${name} image gallery — drag, swipe, or use arrow keys to change angle`}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl cursor-grab md:cursor-grab"
        >
          {FRAMES.map((f, i) => (
            <div
              key={f.file}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              data-idx={i}
              className="relative shrink-0 w-full aspect-square sm:aspect-[4/5] snap-start snap-always flex items-center justify-center"
            >
              <Image
                src={`/product/${f.file}.webp`}
                alt={`${name} — ${f.label}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-contain p-3 sm:p-4 select-none pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Brand glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 35%, rgba(168,255,0,0.08) 100%)",
          }}
        />

        {/* Arrows (desktop) */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous image"
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-bg/70 backdrop-blur border border-border opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-accent hover:text-accent transition-all"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next image"
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-bg/70 backdrop-blur border border-border opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-accent hover:text-accent transition-all"
        >
          <ChevronRight className="w-5 h-5" aria-hidden />
        </button>

        {/* Dot indicators (mobile) */}
        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 md:hidden">
          {FRAMES.map((f, i) => (
            <button
              key={f.file}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Show ${f.label}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-accent" : "w-1.5 bg-border-strong"
              }`}
            />
          ))}
        </div>

        {/* Frame counter */}
        <div className="absolute top-4 right-4 text-xs font-mono tabular-nums text-fg-muted bg-bg/60 backdrop-blur px-2.5 py-1 rounded-full border border-border">
          {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>

        {/* Live region for assistive tech */}
        <p className="sr-only" aria-live="polite">
          Showing image {active + 1} of {total}: {FRAMES[active].label}.
        </p>
      </div>

      {/* Thumbnail strip */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {FRAMES.map((f, i) => (
          <button
            key={f.file}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Show ${f.label}`}
            aria-current={i === active}
            className={`aspect-square relative rounded-xl overflow-hidden bg-bg-elev border-2 transition-colors ${
              i === active
                ? "border-accent"
                : "border-border hover:border-border-strong"
            }`}
          >
            <Image
              src={`/product/${f.file}.webp`}
              alt=""
              fill
              className="object-contain p-2"
              sizes="(min-width: 1024px) 120px, 20vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
