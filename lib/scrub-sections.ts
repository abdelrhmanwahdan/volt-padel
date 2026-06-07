/**
 * Canonical scroll-scrub frame sections.
 *
 * Both `app/page.tsx` (which renders the sections) and
 * `components/hero-loader.tsx` (which preloads every frame before dismissing)
 * read from this list. If you add a chapter video, add it here too.
 */
export type ScrubSection = {
  framesDir: string;
  framesCount: number;
};

export const SCRUB_SECTIONS: readonly ScrubSection[] = [
  { framesDir: "/scrub/hero", framesCount: 96 },
  { framesDir: "/scrub/charge", framesCount: 96 },
  { framesDir: "/scrub/impact", framesCount: 42 },
] as const;

export const TOTAL_SCRUB_FRAMES = SCRUB_SECTIONS.reduce(
  (n, s) => n + s.framesCount,
  0,
);
