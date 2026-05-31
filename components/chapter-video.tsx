import ScrollScrubVideo from "./scroll-scrub-video";

type Props = {
  src: string;
  poster?: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Where the text sits inside the 100vh canvas */
  align?: "bottom-left" | "bottom-right" | "center";
  /** Total section height in viewport units (default 250vh = 150vh of scrub distance) */
  scrollHeight?: number;
  /** Subtle dark overlay over the video for text legibility (0..1) */
  vignette?: number;
};

export default function ChapterVideo({
  src,
  poster,
  eyebrow,
  title,
  body,
  align = "bottom-left",
  scrollHeight = 250,
  vignette = 0.45,
}: Props) {
  // flex-col means items-* is horizontal (cross-axis) and justify-* is vertical (main-axis).
  // bottom-left  = items-start (left)  + justify-end (bottom)
  // bottom-right = items-end   (right) + justify-end (bottom)
  // Mobile bottom padding uses calc(6rem + env(safe-area-inset-bottom)) so the
  // title clears the 64px tab bar + iPhone home-indicator gutter.
  const alignClasses =
    align === "center"
      ? "items-center justify-center text-center pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-0"
      : align === "bottom-right"
        ? "items-end justify-end text-right pb-[calc(6rem+env(safe-area-inset-bottom))] pr-6 sm:pb-24 sm:pr-10 lg:pb-32 lg:pr-20"
        : "items-start justify-end text-left pb-[calc(6rem+env(safe-area-inset-bottom))] pl-6 sm:pb-24 sm:pl-10 lg:pb-32 lg:pl-20";

  const sideGradientDir =
    align === "bottom-right" ? "to left" : align === "center" ? "to top" : "to right";

  return (
    <ScrollScrubVideo src={src} poster={poster} alt={title} scrollHeight={scrollHeight}>
      {/* Side gradient for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(${sideGradientDir}, rgba(0,0,0,${vignette}) 0%, rgba(0,0,0,${
            vignette * 0.4
          }) 35%, rgba(0,0,0,0) 70%)`,
        }}
      />
      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      <div className={`relative z-10 h-full w-full flex flex-col px-6 ${alignClasses}`}>
        <div className="max-w-[34rem]">
          <p className="hidden md:block text-eyebrow mb-4">{eyebrow}</p>
          <h2
            className="text-display text-fg md:mb-5"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
          >
            {title}
          </h2>
          <p className="hidden md:block text-fg-muted text-base md:text-lg leading-relaxed">
            {body}
          </p>
        </div>
      </div>
    </ScrollScrubVideo>
  );
}
