import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

// Scroll-scrub videos need byte-range support. Cloudflare Pages doesn't honor
// Range requests for static assets, which leaves video.currentTime seeks frozen
// on the poster frame. jsDelivr serves the same files straight from the GitHub
// repo with full byte-range support, so we point at it in production.
//
// The git ref is computed at build time in next.config.ts (env field) and
// inlined into the client bundle so preview branches and pinned releases each
// get their own jsDelivr URL — no shared cache with `main`. Bumping the ref
// side-steps the 12h jsDelivr cache without needing the purge API.
const MEDIA_REF = process.env.NEXT_PUBLIC_MEDIA_REF || "main";
const JSDELIVR_BASE = `https://cdn.jsdelivr.net/gh/abdelrhmanwahdan/volt-padel@${MEDIA_REF}/public`;

export function mediaUrl(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return process.env.NODE_ENV === "production"
    ? `${JSDELIVR_BASE}${clean}`
    : clean;
}
