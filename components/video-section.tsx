"use client";
import { useEffect, useRef, useState } from "react";

export default function VideoSection({
  src,
  poster,
  eyebrow,
  title,
  body,
  reverse = false,
  loop = false,
}: {
  src: string;
  poster?: string;
  eyebrow: string;
  title: string;
  body: string;
  reverse?: boolean;
  loop?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    const s = sectionRef.current;
    if (!v || !s) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().catch(() => {});
          setPlayed(true);
        } else if (!loop) {
          v.pause();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(s);
    return () => obs.disconnect();
  }, [loop]);

  return (
    <section ref={sectionRef} className="py-32 md:py-48 px-6 lg:px-10 max-w-[1400px] mx-auto">
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
          reverse ? "lg:grid-flow-dense" : ""
        }`}
      >
        <div className={reverse ? "lg:col-start-2" : ""}>
          <p className="text-eyebrow mb-4">{eyebrow}</p>
          <h2
            className="text-display text-fg mb-6"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}
          >
            {title}
          </h2>
          <p className="text-fg-muted leading-relaxed text-lg max-w-[36ch]">{body}</p>
        </div>
        <div
          className={`relative aspect-square rounded-2xl overflow-hidden bg-bg-elev border border-border ${
            reverse ? "lg:col-start-1" : ""
          }`}
        >
          <video
            ref={ref}
            src={src}
            poster={poster}
            muted
            loop={loop}
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!played && !poster && (
            <div className="absolute inset-0 flex items-center justify-center text-fg-faint text-eyebrow">
              Loading
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
