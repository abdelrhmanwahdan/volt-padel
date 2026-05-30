"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Check } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Mock submit — wire to real service later
    setTimeout(() => setSent(true), 400);
  };

  return (
    <div className="pt-24 pb-24 max-w-[1200px] mx-auto px-6 lg:px-10">
      <p className="text-eyebrow mb-4">Contact</p>
      <h1
        className="text-display text-fg mb-12"
        style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
      >
        Reach the workshop.
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-20">
        {/* Form */}
        <div>
          {sent ? (
            <div className="rounded-2xl border border-accent/40 bg-accent/5 p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-accent text-bg mx-auto flex items-center justify-center mb-4 accent-glow">
                <Check className="w-5 h-5" strokeWidth={3} />
              </div>
              <p className="text-eyebrow mb-2">Message sent</p>
              <h2 className="text-2xl font-semibold mb-4">We'll reply within 24h.</h2>
              <p className="text-fg-muted">Check your inbox — including your spam folder.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Name" name="name" required />
                <Field label="Email" name="email" type="email" required />
              </div>
              <Field label="Subject" name="subject" required />
              <label className="block">
                <span className="block text-xs text-fg-muted font-mono uppercase tracking-widest mb-1.5">
                  Message
                </span>
                <textarea
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border focus:border-accent focus:outline-none text-fg placeholder:text-fg-faint resize-y transition-colors"
                />
              </label>
              <button
                type="submit"
                className="h-12 px-8 rounded-full bg-accent text-bg font-semibold hover:bg-fg transition-colors"
              >
                Send message
              </button>
            </form>
          )}
        </div>

        {/* Channels */}
        <aside className="space-y-4">
          <ContactCard
            icon={<Mail className="w-5 h-5" />}
            title="Support"
            value="help@volt-padel.example"
            href="mailto:help@volt-padel.example"
          />
          <ContactCard
            icon={<MessageCircle className="w-5 h-5" />}
            title="Press & partnerships"
            value="press@volt-padel.example"
            href="mailto:press@volt-padel.example"
          />
          <ContactCard
            icon={<MapPin className="w-5 h-5" />}
            title="Workshop"
            value={`Solna Strandväg 78\n171 54 Solna · Sweden`}
          />

          <div
            id="shipping"
            className="mt-10 pt-8 border-t border-border space-y-4 text-sm text-fg-muted"
          >
            <p className="text-eyebrow text-fg">Shipping & returns</p>
            <p>· Free shipping worldwide.</p>
            <p>· Europe: 2–4 business days. NA: 4–7. RoW: 7–12.</p>
            <p>· 30-day returns, no questions.</p>
            <p>· 2-year structural warranty.</p>
            <p>
              <Link href="/faq" className="text-accent hover:underline underline-offset-4">
                More in the FAQ →
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-xs text-fg-muted font-mono uppercase tracking-widest mb-1.5">
        {label}
      </span>
      <input
        {...props}
        className="w-full h-12 px-4 rounded-xl bg-bg border border-border focus:border-accent focus:outline-none text-fg placeholder:text-fg-faint transition-colors"
      />
    </label>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="text-accent mb-3">{icon}</div>
      <p className="text-eyebrow mb-2">{title}</p>
      <p className="text-fg whitespace-pre-line text-sm">{value}</p>
    </>
  );
  const className =
    "block p-5 rounded-2xl border border-border bg-bg-elev/30 hover:border-accent transition-colors";
  return href ? (
    <a href={href} className={className}>
      {inner}
    </a>
  ) : (
    <div className={className}>{inner}</div>
  );
}
