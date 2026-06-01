/**
 * Single source of truth for the videos that appear on the home route.
 * Both `app/page.tsx` (the actual <video> elements) and `components/hero-loader.tsx`
 * (the preloader that warms HTTP cache before the scroll-scrub sections mount)
 * import from here, so adding a new chapter video can never silently skip the
 * preload step.
 */
export const HOME_VIDEOS = [
  "/videos/hero.mp4",
  "/videos/charge.mp4",
  "/videos/impact.mp4",
] as const;
