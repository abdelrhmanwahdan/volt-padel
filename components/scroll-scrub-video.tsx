"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  /** Frame directory under /public (e.g. "/scrub/hero"). Frames are 1-indexed,
   *  4-digit zero-padded WebP at `${framesDir}/0001.webp` … `${framesDir}/{count}.webp`. */
  framesDir: string;
  framesCount: number;
  poster?: string;
  alt: string;
  /** Total section height in viewport units. The first 100vh is the sticky stage;
   *  the remainder is the scroll distance that maps to the frame sequence. */
  scrollHeight?: number;
  /** Overlay content rendered on top of the pinned canvas (titles, eyebrows). */
  children?: ReactNode;
  className?: string;
};

const framePath = (dir: string, i: number) =>
  `${dir}/${i.toString().padStart(4, "0")}.webp`;

/**
 * Scroll-scrubbed full-bleed image sequence (canvas).
 *
 * Same architecture on desktop and mobile — frames load independently via
 * HTTP/2, scrub gracefully degrades as more frames arrive. No <video>
 * element, so no decoder bottleneck, no buffered-range stutter, no iOS
 * Safari play()/seek() restrictions. The Apple/AirPods Pro pattern.
 *
 * Loading: eager-loads the first 6 frames inline, idle-queues the rest the
 * moment the section is one viewport away (IntersectionObserver rootMargin
 * 100% 0px). Pinned for `scrollHeight` viewports; scroll position is mapped
 * linearly to frame index.
 *
 * Reduced motion: renders the poster as a static image, no scrub.
 */
export default function ScrollScrubVideo({
  framesDir,
  framesCount,
  poster,
  alt,
  scrollHeight = 250,
  children,
  className = "",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const total = framesCount;
    const EAGER = Math.min(6, total);
    let queued = false;

    const eager = Array.from({ length: EAGER }, (_, i) => {
      const img = new Image();
      img.src = framePath(framesDir, i + 1);
      return img;
    });
    imagesRef.current = eager;

    if (eager[0].complete && eager[0].naturalWidth > 0) {
      setReady(true);
    } else {
      eager[0].addEventListener("load", () => setReady(true), { once: true });
    }

    const queueRest = () => {
      if (queued) return;
      queued = true;
      const run = () => {
        for (let i = EAGER; i < total; i++) {
          const img = new Image();
          img.src = framePath(framesDir, i + 1);
          imagesRef.current[i] = img;
        }
      };
      if ("requestIdleCallback" in window) {
        (window as Window).requestIdleCallback!(run);
      } else {
        setTimeout(run, 100);
      }
    };

    // Find the nearest loaded frame at or before the requested index, so the
    // scrub gracefully degrades while frames are still trickling in instead
    // of going blank.
    const findNearest = (target: number): HTMLImageElement | null => {
      const arr = imagesRef.current;
      for (let i = target; i >= 0; i--) {
        const img = arr[i];
        if (img && img.complete && img.naturalWidth > 0) return img;
      }
      for (let i = target + 1; i < arr.length; i++) {
        const img = arr[i];
        if (img && img.complete && img.naturalWidth > 0) return img;
      }
      return null;
    };

    const drawFrame = (frame: number) => {
      const idx = Math.max(0, Math.min(total - 1, Math.round(frame)));
      const img = findNearest(idx);
      if (!img) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const cw = canvas.clientWidth * dpr;
      const ch = canvas.clientHeight * dpr;
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      ctx.clearRect(0, 0, cw, ch);
      // object-cover — fill the canvas, crop overflow
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw: number, dh: number;
      if (ir > cr) {
        dh = ch;
        dw = dh * ir;
      } else {
        dw = cw;
        dh = dw / ir;
      }
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    let rafId = 0;
    let running = false;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const winH = window.innerHeight;
      const distance = Math.max(rect.height - winH, 1);
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / distance));
      drawFrame(progress * (total - 1));
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      tick();
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          queueRest();
          start();
        } else {
          stop();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(section);

    // Paint frame 0 immediately so the canvas isn't blank under the poster.
    const paintFirst = () => drawFrame(0);
    if (eager[0].complete) paintFirst();
    else eager[0].addEventListener("load", paintFirst, { once: true });

    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [framesDir, framesCount, reducedMotion]);

  // Reduced motion — just the poster.
  if (reducedMotion) {
    return (
      <section
        ref={sectionRef}
        className={`relative w-full h-screen overflow-hidden bg-bg ${className}`}
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        {children}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`relative w-full bg-bg ${className}`}
      style={{ height: `${scrollHeight}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <canvas
          ref={canvasRef}
          aria-label={alt}
          role="img"
          className="absolute inset-0 w-full h-full transition-opacity duration-300"
          style={{ opacity: ready ? 1 : 0 }}
        />
        {children}
      </div>
    </section>
  );
}
