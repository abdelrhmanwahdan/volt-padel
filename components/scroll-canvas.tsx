"use client";
import { useEffect, useRef } from "react";

const FRAME_COUNT = 148;
const framePath = (i: number) =>
  `/hero/desktop/frame_${i.toString().padStart(4, "0")}.webp`;

export default function ScrollCanvas({
  chapters,
}: {
  chapters: { eyebrow: string; title: string; body: string }[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const eager = Array.from({ length: 10 }, (_, i) => {
      const img = new Image();
      img.src = framePath(i + 1);
      return img;
    });
    imagesRef.current = eager;
    const remaining = () => {
      for (let i = 10; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = framePath(i + 1);
        imagesRef.current[i] = img;
      }
    };
    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback!(remaining);
    } else {
      setTimeout(remaining, 100);
    }
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    const section = sectionRef.current;
    if (!c || !section) return;

    const drawFrame = (frame: number) => {
      const img = imagesRef.current[Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(frame)))];
      if (!img || !img.complete) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = c.clientWidth * dpr;
      const h = c.clientHeight * dpr;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      ctx.clearRect(0, 0, c.width, c.height);
      // contain-fit, then scale up on mobile so the racket fills more of the frame.
      // The source frames have heavy whitespace around the racket; the extra scale
      // crops away that whitespace and makes the product roughly 50% larger.
      const isPortrait = c.height > c.width;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const cRatio = c.width / c.height;
      let dw = c.width;
      let dh = c.height;
      if (imgRatio > cRatio) {
        dh = c.width / imgRatio;
      } else {
        dw = c.height * imgRatio;
      }
      if (isPortrait) {
        const scale = 1.5;
        dw *= scale;
        dh *= scale;
      }
      const dx = (c.width - dw) / 2;
      const dy = (c.height - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const rect = section.getBoundingClientRect();
        const total = section.offsetHeight - window.innerHeight;
        const progress = Math.max(0, Math.min(1, -rect.top / total));
        frameRef.current = progress * (FRAME_COUNT - 1);
        drawFrame(frameRef.current);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Reduced-motion: render frame 1 statically.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.removeEventListener("scroll", onScroll);
      drawFrame(0);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full">
        {/* Mobile: canvas occupies top 60vh; text overlay sits below.
            Desktop: canvas fills the screen and text is side-anchored over it. */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 right-0 h-[60vh] md:h-full w-full"
        />
        <div className="absolute top-[60vh] left-0 right-0 bottom-0 md:inset-0 pointer-events-none">
          {chapters.map((ch, i) => {
            const start = i / chapters.length;
            const end = (i + 1) / chapters.length;
            return (
              <ChapterText
                key={ch.title}
                chapter={ch}
                rangeStart={start}
                rangeEnd={end}
                side={i % 2 === 0 ? "right" : "left"}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ChapterText({
  chapter,
  rangeStart,
  rangeEnd,
  side,
}: {
  chapter: { eyebrow: string; title: string; body: string };
  rangeStart: number;
  rangeEnd: number;
  side: "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const section = el?.closest("section");
    if (!el || !section) return;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      const local = (progress - rangeStart) / (rangeEnd - rangeStart);
      let opacity = 0;
      if (local > 0.05 && local < 0.95) {
        if (local < 0.25) opacity = (local - 0.05) / 0.2;
        else if (local > 0.75) opacity = (0.95 - local) / 0.2;
        else opacity = 1;
      }
      el.style.opacity = `${opacity}`;
      el.style.transform = `translateY(${(1 - Math.min(1, local * 2)) * 20}px)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [rangeStart, rangeEnd]);
  return (
    <div
      ref={ref}
      className={`absolute px-6 max-w-[28rem] transition-none
        inset-0 m-auto h-fit text-center
        md:inset-auto md:top-1/2 md:-translate-y-1/2
        ${
          side === "right"
            ? "md:right-16 md:text-right"
            : "md:left-16 md:text-left"
        }`}
      style={{ opacity: 0 }}
    >
      <p className="text-eyebrow mb-3">{chapter.eyebrow}</p>
      <h3 className="text-display text-fg mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
        {chapter.title}
      </h3>
      <p className="text-fg-muted leading-relaxed">{chapter.body}</p>
    </div>
  );
}
