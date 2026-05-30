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
// In dev we keep the local /videos/* path for fast iteration.
const JSDELIVR_BASE =
  "https://cdn.jsdelivr.net/gh/abdelrhmanwahdan/volt-padel@main/public";

export function mediaUrl(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return process.env.NODE_ENV === "production"
    ? `${JSDELIVR_BASE}${clean}`
    : clean;
}
