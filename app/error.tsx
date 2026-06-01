"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Zap } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface unexpected errors in the browser console; once analytics ships
    // this is where the event would be sent.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-20">
      <Zap className="w-10 h-10 text-accent mb-6" fill="currentColor" aria-hidden />
      <p className="text-eyebrow mb-4">Misfire · Something went wrong</p>
      <h1
        className="text-display text-fg mb-6"
        style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
      >
        That swing didn't connect.
      </h1>
      <p className="text-fg-muted max-w-md mb-10 text-lg">
        An unexpected error interrupted the page. Try again, or head back to the
        court.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="h-12 px-8 inline-flex items-center justify-center rounded-full bg-accent text-bg font-semibold hover:bg-fg transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="h-12 px-8 inline-flex items-center justify-center rounded-full border border-border-strong hover:border-accent hover:text-accent transition-colors"
        >
          Back to home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-10 text-xs font-mono text-fg-faint">
          ref: {error.digest}
        </p>
      )}
    </div>
  );
}
