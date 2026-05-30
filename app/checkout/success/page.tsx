"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { Check, Mail, Truck, ShieldCheck } from "lucide-react";

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessSkeleton />}>
      <SuccessInner />
    </Suspense>
  );
}

function SuccessSkeleton() {
  return (
    <div className="pt-32 pb-32 max-w-3xl mx-auto px-6 lg:px-10 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-bg-elev mb-8" />
      <p className="text-eyebrow mb-3 opacity-50">Order charged</p>
    </div>
  );
}

function SuccessInner() {
  const search = useSearchParams();
  const orderId = search.get("order") ?? "VLT-XXXXXX";
  const clear = useCart((s) => s.clear);
  const [eta, setEta] = useState("3 – 5 business days");

  useEffect(() => {
    clear();
    const d = new Date();
    d.setDate(d.getDate() + 4);
    setEta(
      d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    );
  }, [clear]);

  return (
    <div className="pt-32 pb-32 max-w-3xl mx-auto px-6 lg:px-10 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-accent text-bg flex items-center justify-center mb-8 accent-glow">
        <Check className="w-7 h-7" strokeWidth={3} />
      </div>
      <p className="text-eyebrow mb-3">Order charged</p>
      <h1
        className="text-display text-fg mb-4"
        style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
      >
        You're charged up.
      </h1>
      <p className="text-fg-muted text-lg mb-2">
        Thank you. Your VÖLT racket is on its way.
      </p>
      <p className="font-mono text-fg-faint text-sm">Order #{orderId}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 text-left">
        <SuccessCard
          icon={<Mail className="w-5 h-5" />}
          title="Confirmation sent"
          body="Look for an order summary in your inbox in the next minute."
        />
        <SuccessCard
          icon={<Truck className="w-5 h-5" />}
          title="Arrives by"
          body={eta}
        />
        <SuccessCard
          icon={<ShieldCheck className="w-5 h-5" />}
          title="Covered"
          body="2-year frame warranty · 30-day return window."
        />
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="h-12 px-8 inline-flex items-center justify-center rounded-full border border-border-strong hover:border-accent hover:text-accent transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="h-12 px-8 inline-flex items-center justify-center rounded-full bg-accent text-bg font-semibold hover:bg-fg transition-colors"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}

function SuccessCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-5 bg-bg-elev/30">
      <div className="text-accent mb-3">{icon}</div>
      <p className="font-semibold mb-1 text-fg">{title}</p>
      <p className="text-sm text-fg-muted leading-relaxed">{body}</p>
    </div>
  );
}
