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
 * prefers-reduced-motion. The scrub loop only runs while the section is
 * intersecting the viewport — no idle CPU off-screen.
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
    let lastT = performance.now();
    let running = false;
    let onScreen = false;
    let primed = false;

    const tick = (now: number) => {
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
      let target = progress * duration;

      // Buffer-aware clamp — don't ask the player to seek past data that
      // hasn't loaded yet. Without this, a fast scroll on a slow network
      // sets currentTime to (say) 5s while only 2s is buffered; the player
      // freezes silently at the last buffered frame and the user reaches
      // the end of the section having seen only half the video. Clamping
      // makes the scrub pause at the buffered edge and resume as bytes
      // arrive — much smoother failure mode.
      if (video.buffered.length > 0) {
        let bufferedEnd = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          if (
            video.buffered.start(i) <= cur + 0.1 &&
            video.buffered.end(i) > bufferedEnd
          ) {
            bufferedEnd = video.buffered.end(i);
          }
        }
        if (bufferedEnd > 0) target = Math.min(target, bufferedEnd - 0.05);
      }

      // Delta-time eased interpolation — same feel at 30/60/120Hz.
      // Catch-up rate accelerates when the playhead is far behind (e.g. a
      // flick-scroll). Tuned base 0.18 at 16.66ms/frame; up to 0.45 when
      // the gap exceeds half a second.
      const dt = Math.min(now - lastT, 50);
      lastT = now;
      const gap = Math.abs(target - cur);
      const baseK = gap > 0.5 ? 0.35 : 0.18;
      const k = 1 - Math.pow(1 - baseK, dt / 16.66);
      cur += (target - cur) * k;
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

    // iOS Safari paints a black rectangle for un-primed <video> elements until
    // play() is called. Await it before starting the rAF so the first seeks
    // don't race against a video that hasn't received any frames yet.
    const prime = async () => {
      if (primed) return;
      try {
        await video.play();
        video.pause();
      } catch {
        /* play() can reject on some browsers — fall through */
      }
      primed = true;
    };

    const start = async () => {
      if (running) return;
      running = true;
      await prime();
      lastT = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Mark ready only after a frame has actually been painted (first seeked
    // event), so the poster fallback stays visible until the video can show
    // real frames. Prevents the iOS-Safari black-screen flash.
    const onSeeked = () => setReady(true);
    video.addEventListener("seeked", onSeeked);

    // IntersectionObserver gates the rAF — no idle CPU when off-screen.
    // rootMargin pre-arms the scrub one viewport early so the first seek
    // doesn't visibly jump when the section enters.
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
        if (onScreen) {
          // HAVE_CURRENT_DATA (2) — enough to seek without exceptions
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
            {/* Permanent poster backdrop — stays behind the video so iOS Safari
                never reveals its black un-primed video rectangle. Once the
                video has painted its first frame (ready === true), it covers
                the poster naturally on browsers that paint, and harmlessly
                sits on top of the poster on browsers that don't. */}
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
          </>
        )}
        {children}
      </div>
    </section>
  );
}
