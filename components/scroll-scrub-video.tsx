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
};

type Mode = "loading" | "scrub" | "loop" | "static";

const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

/**
 * Scroll-scrubbed full-bleed video.
 *
 * Desktop: pins for `scrollHeight` viewports and scrubs currentTime against
 * scroll position with the serialize-seeks pattern (one seek in flight, gated
 * by the `seeked` event).
 *
 * Touch devices (mobile / tablet): scroll-scrub is unreliable on iOS Safari —
 * `video.play()` is blocked without a user gesture, so the prime step rejects,
 * `seeked` never fires, and the video stays at `opacity: 0` showing only the
 * poster. On touch, fall back to a plain `<video autoplay muted loop
 * playsInline>` background — section becomes 100vh, no pinning, video loops.
 * Title overlay (children) still renders. Standard Apple/Sony mobile pattern.
 *
 * Reduced motion: render the poster as a static `<img>`.
 */
export default function ScrollScrubVideo({
  src,
  poster,
  alt,
  scrollHeight = 250,
  children,
  className = "",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Starts "loading" so SSR HTML is neutral (poster only). After mount we
  // resolve the actual mode based on the device. The HeroLoader covers the
  // first paint, so the mode-resolution flash is never visible.
  const [mode, setMode] = useState<Mode>("loading");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqTouch = window.matchMedia(TOUCH_QUERY);

    const resolve = () => {
      if (mqMotion.matches) setMode("static");
      else if (mqTouch.matches) setMode("loop");
      else setMode("scrub");
    };
    resolve();

    mqMotion.addEventListener("change", resolve);
    mqTouch.addEventListener("change", resolve);
    return () => {
      mqMotion.removeEventListener("change", resolve);
      mqTouch.removeEventListener("change", resolve);
    };
  }, []);

  // Warm the HTTP cache with the full video bytes on mount (scrub mode only;
  // the loop-mode <video> element pulls bytes itself via autoplay, so the
  // pre-fetch would just race the element's own request and waste bandwidth).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mode !== "scrub") return;
    const ctl = new AbortController();
    fetch(src, { signal: ctl.signal }).catch(() => {});
    return () => ctl.abort();
  }, [src, mode]);

  useEffect(() => {
    if (mode !== "scrub") return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let rafId = 0;
    let pendingTarget = 0;
    let seekInFlight = false;
    let running = false;
    let onScreen = false;
    let primed = false;

    // Serialize seeks — only one in flight at a time. Issuing currentTime
    // updates faster than the decoder can paint them just drops frames and
    // leaves the playhead visibly behind scroll position.
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

  // Loop mode (touch / mobile) — autoplay + loop, no pinning. Section is one
  // screen tall so the user scrolls past it normally.
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

  // Static mode (reduced motion) — just the poster.
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

  // Scrub mode (desktop) and loading mode (SSR / pre-resolve) — same layout
  // and DOM. In loading mode, ready stays false so the video sits at opacity 0
  // behind the poster; once mode flips to "scrub" the rAF starts and the
  // first painted seek flips opacity to 1.
  const stageHeight = mode === "scrub" ? `${scrollHeight}vh` : "100vh";
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
