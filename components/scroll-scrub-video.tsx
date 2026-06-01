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
    let pendingTarget = 0;
    let seekInFlight = false;
    let running = false;
    let onScreen = false;
    let primed = false;

    // Serialize seeks — only one in flight at a time. Issuing currentTime
    // updates faster than the decoder can paint them (which is what a 60Hz
    // rAF does on a QHD video) just drops frames and leaves the playhead
    // visibly behind scroll position. Instead: set currentTime once, wait
    // for the seeked event, then set it again to the latest scroll target.
    // This caps seek rate at ~decoder-throughput Hz and keeps the painted
    // frame in sync with where the user is.
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
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };

    // Mark ready only after a frame has actually been painted (first seeked
    // event), so the poster fallback stays visible until the video can show
    // real frames. Prevents the iOS-Safari black-screen flash. The same
    // seeked event also clears our serialize-seeks gate so the next target
    // can be issued.
    const onSeeked = () => {
      setReady(true);
      onSeekDone();
    };
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
