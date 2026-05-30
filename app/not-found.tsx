import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = { title: "404 — Page not found" };

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-20">
      <Zap className="w-10 h-10 text-accent mb-6" fill="currentColor" aria-hidden />
      <p className="text-eyebrow mb-4">Error 404 · Off-court</p>
      <h1
        className="text-display text-fg mb-6"
        style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
      >
        That page didn't return the volley.
      </h1>
      <p className="text-fg-muted max-w-md mb-10 text-lg">
        The page you're looking for is out of bounds — but the racket is right here.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="h-12 px-8 inline-flex items-center justify-center rounded-full bg-accent text-bg font-semibold hover:bg-fg transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/product"
          className="h-12 px-8 inline-flex items-center justify-center rounded-full border border-border-strong hover:border-accent hover:text-accent transition-colors"
        >
          Shop the racket
        </Link>
      </div>
    </div>
  );
}
