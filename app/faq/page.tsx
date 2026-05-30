import Link from "next/link";

export const metadata = { title: "FAQ — Answers about the Pro 3K" };

const FAQS = [
  {
    q: "Who is the Pro 3K for?",
    a: "Intermediate and advanced players who attack on demand. The teardrop shape and medium-high balance favor control players who can generate their own power on víbora and bandeja shots. If you're a beginner looking for forgiveness above all, the Pro 3K may be too rewarding of intent.",
  },
  {
    q: "Why only one model?",
    a: "Because shipping eight models means making seven compromises. We'd rather be exceptional at one thing than mediocre at many. When we have a meaningfully better racket, we'll release a second model. Until then, this is the answer.",
  },
  {
    q: "How does the Pro 3K compare to Bullpadel / Nox / Babolat?",
    a: "Honestly: the major brands make excellent rackets. The Pro 3K is lighter, has a softer EVA core, and a denser hole pattern — these choices favor a specific style of play (control players who attack). If you love your current top-tier racket, this won't replace it. If you've been searching for a sharper response, give us 30 days.",
  },
  {
    q: "Is the racket warrantied?",
    a: "Two years against frame defects, manufacturing flaws, and structural failure under normal play. Cage hits at full swing eventually break any frame — that's not a defect. We replace defective rackets free, no questions asked.",
  },
  {
    q: "Shipping & delivery times?",
    a: "Free shipping worldwide. Europe arrives in 2–4 business days. North America in 4–7. Rest of world in 7–12. Every order ships from our Stockholm workshop within 24 hours of being placed.",
  },
  {
    q: "Can I return it?",
    a: "Yes — 30 days, no questions. Play with it, train with it, take it to a tournament. If it isn't right for you, send it back and we refund the full amount.",
  },
  {
    q: "Do you offer custom colorways?",
    a: "We currently offer three colorways (Electric Green, Stealth Black, Court White). Custom branding for clubs and academies is available for orders of 25+ units — contact us for details.",
  },
  {
    q: "What grip size does it come with?",
    a: "All rackets ship with a 21g matte EVA overgrip pre-installed. Total handle circumference with the overgrip is 4 1/4″ — standard for most players. Replacement overgrips are sold separately.",
  },
];

export default function FAQPage() {
  return (
    <div className="pt-24 pb-24 max-w-[900px] mx-auto px-6 lg:px-10">
      <p className="text-eyebrow mb-4">Frequently asked</p>
      <h1
        className="text-display text-fg mb-12"
        style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
      >
        Real questions, real answers.
      </h1>
      <ul className="divide-y divide-border border-t border-b border-border">
        {FAQS.map((f, i) => (
          <li key={i}>
            <details className="group py-6">
              <summary className="flex items-start gap-6 cursor-pointer list-none">
                <span className="font-mono text-fg-faint tabular-nums text-sm shrink-0 mt-1">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <span className="flex-1 text-lg font-semibold text-fg">{f.q}</span>
                <span className="text-accent text-2xl leading-none transition-transform group-open:rotate-45 mt-1">
                  +
                </span>
              </summary>
              <p className="mt-4 ml-14 text-fg-muted leading-relaxed">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
      <div className="mt-16 text-center">
        <p className="text-fg-muted mb-4">Didn't find your answer?</p>
        <Link
          href="/contact"
          className="inline-flex h-12 px-8 items-center rounded-full border border-border-strong hover:border-accent hover:text-accent transition-colors"
        >
          Ask us directly
        </Link>
      </div>
    </div>
  );
}
