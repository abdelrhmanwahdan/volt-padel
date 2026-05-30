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

/**
 * Scroll-scrubbed full-bleed video.
 *
 * Pins for `scrollHeight` viewports. As the user scrolls through the pinned
 * region, video.currentTime is interpolated from 0 → duration. Scrolling
 * up plays in reverse. Falls back to a static poster image under
 * prefers-reduced-motion.
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
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let rafId = 0;
    let cur = 0;
    let lastSeek = -1;
    let running = false;

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
      const target = progress * duration;
      // Smooth interpolation toward target — gives a cinematic feel
      cur += (target - cur) * 0.18;
      const next = Math.round(cur * 1000) / 1000;
      if (Math.abs(next - lastSeek) > 0.008) {
        try {
          video.currentTime = next;
          lastSeek = next;
        } catch {
          /* seek before metadata loaded — ignore */
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      setReady(true);
      rafId = requestAnimationFrame(tick);
    };

    if (video.readyState >= 1) start();
    else video.addEventListener("loadedmetadata", start, { once: true });

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", start);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={`relative w-full bg-bg ${className}`}
      style={{ height: `${scrollHeight}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {reducedMotion && poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            {poster && !ready && (
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
              className="absolute inset-0 w-full h-full object-cover"
            />
          </>
        )}
        {children}
      </div>
    </section>
  );
}
