export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="pt-24 pb-24 max-w-[760px] mx-auto px-6 lg:px-10 prose-volt">
      <p className="text-eyebrow mb-4">Legal</p>
      <h1
        className="text-display text-fg mb-3"
        style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
      >
        Privacy Policy
      </h1>
      <p className="text-fg-faint text-sm mb-12">Last updated: January 2026</p>

      <div className="space-y-8 text-fg-muted leading-relaxed">
        <Section title="What we collect">
          Name, email, shipping address, and payment details when you place an order.
          Usage analytics (page views, device type) via privacy-respecting tools. We do
          not sell or share your data.
        </Section>
        <Section title="Why we collect it">
          To process orders, deliver rackets, send you a confirmation email, and
          improve the website. That's it.
        </Section>
        <Section title="How long we keep it">
          Order records for 7 years (legal requirement). Analytics for 24 months.
          Anything else you ask us to delete — we delete on request.
        </Section>
        <Section title="Your rights (GDPR / CCPA)">
          Access, correct, export, or delete your data anytime by emailing
          help@volt-padel.example. We respond within 14 days.
        </Section>
        <Section title="Cookies">
          Strictly-necessary only. No third-party tracking cookies, no advertising
          pixels.
        </Section>
        <Section title="Changes">
          We'll notify registered customers by email if this policy materially changes.
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-fg text-xl font-semibold mb-2">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
