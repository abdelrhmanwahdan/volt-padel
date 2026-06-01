"use client";
import { useEffect, useRef } from "react";

const FRAME_COUNT = 148;
const framePath = (i: number) =>
  `/hero/desktop/frame_${i.toString().padStart(4, "0")}.webp`;

export type ScrollChapter = {
  eyebrow: string;
  title: string;
  body: string;
  side?: "left" | "right";
};

export default function ScrollCanvas({
  chapters,
}: {
  chapters: ScrollChapter[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Eager-load only the first few frames immediately; defer the rest until
  // the section enters the viewport (saves ~12MB of resident image data on
  // pages that never reach the scroll-canvas section).
  useEffect(() => {
    const EAGER = 8;
    const eager = Array.from({ length: EAGER }, (_, i) => {
      const img = new Image();
      img.src = framePath(i + 1);
      return img;
    });
    imagesRef.current = eager;

    const section = sectionRef.current;
    if (!section) return;

    let loaded = false;
    const loadRest = () => {
      if (loaded) return;
      loaded = true;
      const queue = () => {
        for (let i = EAGER; i < FRAME_COUNT; i++) {
          const img = new Image();
          img.src = framePath(i + 1);
          imagesRef.current[i] = img;
        }
      };
      if ("requestIdleCallback" in window) {
        (window as Window).requestIdleCallback!(queue);
      } else {
        setTimeout(queue, 100);
      }
    };

    // Pre-arm one viewport early so the section is fully loaded by the time
    // the user reaches it.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadRest();
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  // Single shared rAF/scroll loop for the canvas + every ChapterText. They all
  // measure the same section rect, so one read per scroll event broadcasts to
  // all subscribers — no more 5× getBoundingClientRect per frame.
  useEffect(() => {
    const c = canvasRef.current;
    const section = sectionRef.current;
    if (!c || !section) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf: number | null = null;
    let onScreen = true;

    const drawFrame = (frame: number) => {
      const img =
        imagesRef.current[
          Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(frame)))
        ];
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
        const scale = 1.8;
        dw *= scale;
        dh *= scale;
      }
      const dx = (c.width - dw) / 2;
      const dy = (c.height - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const applyChapter = (
      el: HTMLDivElement,
      progress: number,
      start: number,
      end: number,
    ) => {
      const span = Math.max(end - start, 0.0001);
      const local = (progress - start) / span;
      let opacity = 0;
      if (local > 0.05 && local < 0.95) {
        if (local < 0.25) opacity = (local - 0.05) / 0.2;
        else if (local > 0.75) opacity = (0.95 - local) / 0.2;
        else opacity = 1;
      }
      el.style.opacity = `${opacity}`;
      el.style.transform = `translateY(${(1 - Math.min(1, local * 2)) * 20}px)`;
    };

    const tick = () => {
      raf = null;
      const rect = section.getBoundingClientRect();
      const total = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      drawFrame(progress * (FRAME_COUNT - 1));
      const n = chapters.length;
      for (let i = 0; i < n; i++) {
        const el = chapterRefs.current[i];
        if (!el) continue;
        applyChapter(el, progress, i / n, (i + 1) / n);
      }
    };

    const schedule = () => {
      if (raf !== null || !onScreen) return;
      raf = requestAnimationFrame(tick);
    };

    // Initial paint
    tick();

    if (reduceMotion) {
      // Render frame 0 statically; skip the scroll loop entirely.
      drawFrame(0);
      return;
    }

    // Off-screen sections don't need scroll math. Only listen while in view.
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
        if (onScreen) schedule();
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(section);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [chapters]);

  return (
    <section ref={sectionRef} className="relative w-full" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full">
        {/* Mobile: canvas takes top 50vh, racket scaled 1.8x to fill it tightly.
            Text anchors immediately below — no dead space, no overlap with the
            bottom tab bar. Desktop unchanged: canvas full screen, text side-anchored. */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 right-0 h-[50vh] md:h-full w-full"
        />
        <div className="absolute top-[50vh] left-0 right-0 bottom-0 md:inset-0 pointer-events-none">
          {chapters.map((ch, i) => {
            const side = ch.side ?? (i % 2 === 0 ? "right" : "left");
            return (
              <div
                key={ch.title}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
                className={`absolute px-6 max-w-[28rem] transition-none
                  top-3 left-0 right-0 mx-auto h-fit text-center
                  md:inset-auto md:top-1/2 md:-translate-y-1/2 md:mx-0
                  ${
                    side === "right"
                      ? "md:right-16 md:left-auto md:text-right"
                      : "md:left-16 md:right-auto md:text-left"
                  }`}
                style={{ opacity: 0 }}
              >
                <p className="text-eyebrow mb-3">{ch.eyebrow}</p>
                <h3
                  className="text-display text-fg mb-4"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                >
                  {ch.title}
                </h3>
                <p className="text-fg-muted leading-relaxed">{ch.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
