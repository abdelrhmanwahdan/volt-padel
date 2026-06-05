"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  src: string;
  poster?: string;
  alt: string;
  /** Total section height in viewport units. The first 100vh is the sticky stage;
   *  the remainder is the scroll distance that maps to video.duration. */
  scrollHeight?: number;
  /** Overlay content rendered on top of the pinned video (titles, eyebrows, etc.) */
  children?: ReactNode;
  className?: string;
  /** Mobile scroll-scrub image sequence. iOS Safari can't reliably seek <video>
   *  via currentTime without a user gesture, so on touch devices we scrub a
   *  canvas-rendered image sequence instead. Frames must be 1-indexed, 4-digit
   *  zero-padded WebP under `${mobileFramesDir}/0001.webp` … `${mobileFramesDir}/{count}.webp`. */
  mobileFramesDir?: string;
  mobileFramesCount?: number;
};

type Mode = "loading" | "scrub-video" | "scrub-canvas" | "loop" | "static";

const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

const framePath = (dir: string, i: number) =>
  `${dir}/${i.toString().padStart(4, "0")}.webp`;

/**
 * Scroll-scrubbed full-bleed video.
 *
 * - Desktop: pins for `scrollHeight` viewports, scrubs `<video>` currentTime
 *   against scroll using the serialize-seeks pattern.
 * - Touch w/ mobileFramesDir: pins same as desktop but scrubs a canvas-rendered
 *   image sequence — iOS Safari can't reliably seek <video> without a user
 *   gesture, so we render frames instead. Works on every iOS version.
 * - Touch w/o mobileFramesDir: falls back to <video autoplay muted loop
 *   playsInline>, section becomes 100vh.
 * - Reduced motion: static poster.
 */
export default function ScrollScrubVideo({
  src,
  poster,
  alt,
  scrollHeight = 250,
  children,
  className = "",
  mobileFramesDir,
  mobileFramesCount,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [mode, setMode] = useState<Mode>("loading");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqTouch = window.matchMedia(TOUCH_QUERY);

    const resolve = () => {
      if (mqMotion.matches) setMode("static");
      else if (mqTouch.matches) {
        setMode(
          mobileFramesDir && mobileFramesCount ? "scrub-canvas" : "loop",
        );
      } else setMode("scrub-video");
    };
    resolve();

    mqMotion.addEventListener("change", resolve);
    mqTouch.addEventListener("change", resolve);
    return () => {
      mqMotion.removeEventListener("change", resolve);
      mqTouch.removeEventListener("change", resolve);
    };
  }, [mobileFramesDir, mobileFramesCount]);

  // Warm the HTTP cache with the full video bytes on mount (desktop scrub only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mode !== "scrub-video") return;
    const ctl = new AbortController();
    fetch(src, { signal: ctl.signal }).catch(() => {});
    return () => ctl.abort();
  }, [src, mode]);

  // Desktop: <video> scroll-scrub with serialize-seeks
  useEffect(() => {
    if (mode !== "scrub-video") return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let rafId = 0;
    let pendingTarget = 0;
    let seekInFlight = false;
    let running = false;
    let onScreen = false;
    let primed = false;

    const issueNext = () => {
      if (seekInFlight || !running) return;
      const cur = video.currentTime;
      if (Math.abs(pendingTarget - cur) < 0.008) return;
      seekInFlight = true;
      try {
        video.currentTime = pendingTarget;
      } catch {
        seekInFlight = false;
      }
    };

    const onSeekDone = () => {
      seekInFlight = false;
      issueNext();
    };

    const tick = () => {
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const rect = section.getBoundingClientRect();
      const winH = window.innerHeight;
      const distance = Math.max(rect.height - winH, 1);
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / distance));
      pendingTarget = progress * duration;
      issueNext();
      rafId = requestAnimationFrame(tick);
    };

    const prime = async () => {
      if (primed) return;
      try {
        await video.play();
        video.pause();
      } catch {
        /* play() can reject — fall through */
      }
      primed = true;
    };

    const start = async () => {
      if (running) return;
      running = true;
      await prime();
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };

    const onSeeked = () => {
      setReady(true);
      onSeekDone();
    };
    video.addEventListener("seeked", onSeeked);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
        if (onScreen) {
          if (video.readyState >= 2) start();
          else video.addEventListener("loadeddata", start, { once: true });
        } else {
          stop();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(section);

    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadeddata", start);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [mode]);

  // Touch: canvas + image-sequence scroll-scrub. Frames eager-load the first
  // few; the rest are queued on IntersectionObserver pre-arm.
  useEffect(() => {
    if (mode !== "scrub-canvas") return;
    if (!mobileFramesDir || !mobileFramesCount) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const total = mobileFramesCount;
    const EAGER = Math.min(6, total);
    let queued = false;

    const eager = Array.from({ length: EAGER }, (_, i) => {
      const img = new Image();
      img.src = framePath(mobileFramesDir, i + 1);
      return img;
    });
    imagesRef.current = eager;

    // Mark ready as soon as the first frame is decoded — flips opacity 0 → 1
    // so the canvas covers the poster without flash.
    if (eager[0].complete && eager[0].naturalWidth > 0) {
      setReady(true);
    } else {
      eager[0].addEventListener(
        "load",
        () => setReady(true),
        { once: true },
      );
    }

    const queueRest = () => {
      if (queued) return;
      queued = true;
      const run = () => {
        for (let i = EAGER; i < total; i++) {
          const img = new Image();
          img.src = framePath(mobileFramesDir, i + 1);
          imagesRef.current[i] = img;
        }
      };
      if ("requestIdleCallback" in window) {
        (window as Window).requestIdleCallback!(run);
      } else {
        setTimeout(run, 100);
      }
    };

    const drawFrame = (frame: number) => {
      const idx = Math.max(0, Math.min(total - 1, Math.round(frame)));
      const img = imagesRef.current[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
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
    let onScreen = false;

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
        onScreen = entries[0].isIntersecting;
        if (onScreen) {
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
  }, [mode, mobileFramesDir, mobileFramesCount]);

  // Loop mode (touch fallback when frames not provided) — autoplay + loop, 100vh.
  if (mode === "loop") {
    return (
      <section
        ref={sectionRef}
        className={`relative w-full h-screen overflow-hidden bg-bg ${className}`}
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        {children}
      </section>
    );
  }

  // Static mode (reduced motion).
  if (mode === "static") {
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

  // scrub-canvas mode (touch) — same pin layout as desktop, canvas instead of video.
  if (mode === "scrub-canvas") {
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
            aria-hidden
            className="absolute inset-0 w-full h-full transition-opacity duration-300"
            style={{ opacity: ready ? 1 : 0 }}
          />
          {children}
        </div>
      </section>
    );
  }

  // scrub-video mode (desktop) and loading mode (SSR / pre-resolve).
  const stageHeight =
    mode === "scrub-video" ? `${scrollHeight}vh` : "100vh";
  return (
    <section
      ref={sectionRef}
      className={`relative w-full bg-bg ${className}`}
      style={{ height: stageHeight }}
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
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: ready ? 1 : 0 }}
        />
        {children}
      </div>
    </section>
  );
}
