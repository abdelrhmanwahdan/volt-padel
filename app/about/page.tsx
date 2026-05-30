import Link from "next/link";

export const metadata = { title: "Story — Where VÖLT comes from" };

export default function AboutPage() {
  return (
    <div className="pt-24">
      <section className="px-6 lg:px-10 py-24 max-w-[900px] mx-auto">
        <p className="text-eyebrow mb-4">Story</p>
        <h1
          className="text-display text-fg mb-10"
          style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
        >
          One racket. One decision.
        </h1>
        <div className="space-y-6 text-lg text-fg-muted leading-relaxed">
          <p>
            VÖLT started in a workshop outside Stockholm in 2024, between an engineer
            who'd spent a decade laying carbon on Formula 1 monocoques and a former
            World Padel Tour player who was tired of rackets that promised everything
            and remembered nothing.
          </p>
          <p>
            They had one rule: build one racket. Get it right. Don't fragment a line
            into eight half-decisions. The Pro 3K is the result — a single charged
            object that does one thing exceptionally: it gives back what you put in.
          </p>
        </div>
      </section>

      <section
        id="manifesto"
        className="border-y border-border bg-bg-elev/30 py-24 px-6 lg:px-10"
      >
        <div className="max-w-[900px] mx-auto">
          <p className="text-eyebrow mb-6">Manifesto</p>
          <ul className="space-y-6 text-2xl md:text-3xl font-display tracking-[-0.02em] leading-snug">
            <li>
              <span className="text-accent">→</span> One product, made well, beats a
              catalog of compromise.
            </li>
            <li>
              <span className="text-accent">→</span> The racket should disappear in your
              hand. The shot should not.
            </li>
            <li>
              <span className="text-accent">→</span> Engineering is a love letter to the
              player who deserves it.
            </li>
            <li>
              <span className="text-accent">→</span> Carbon is honest. Marketing is
              optional.
            </li>
            <li>
              <span className="text-accent">→</span> If we can't improve it, we won't
              ship a new model just to ship one.
            </li>
          </ul>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-24 max-w-[900px] mx-auto">
        <p className="text-eyebrow mb-4">Where it's made</p>
        <h2
          className="text-display text-fg mb-8"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          Stockholm. Pressure cured. Hand finished.
        </h2>
        <p className="text-fg-muted text-lg leading-relaxed mb-4">
          Every Pro 3K is laid by hand in our Solna workshop, pressure-cured for eight
          hours at 130°C, then individually weight-balanced before the grip goes on. We
          weigh, log, and serialize every unit. Your racket ships with its own QC
          card.
        </p>
        <p className="text-fg-muted text-lg leading-relaxed">
          We tested every prototype on the courts of Marbella, Spain — six weeks of
          padel club abuse before any version went to production. The Pro 3K is the
          seventeenth prototype.
        </p>
      </section>

      <section className="text-center py-24 px-6">
        <Link
          href="/product"
          className="inline-flex h-14 px-10 items-center rounded-full bg-accent text-bg font-semibold text-lg hover:bg-fg transition-colors"
        >
          See the racket
        </Link>
      </section>
    </div>
  );
}
