export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="pt-24 pb-24 max-w-[760px] mx-auto px-6 lg:px-10">
      <p className="text-eyebrow mb-4">Legal</p>
      <h1
        className="text-display text-fg mb-3"
        style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
      >
        Terms of Service
      </h1>
      <p className="text-fg-faint text-sm mb-12">Last updated: January 2026</p>

      <div className="space-y-8 text-fg-muted leading-relaxed">
        <Section title="Orders">
          Placing an order is an offer to purchase. We reserve the right to refuse or
          cancel any order for reasons including stock, pricing errors, or suspected
          fraud. You'll be refunded in full if we cancel.
        </Section>
        <Section title="Pricing & payment">
          Prices are in USD and exclude taxes unless stated. We charge your card at the
          moment of order placement. Sales tax is applied based on shipping address.
        </Section>
        <Section title="Shipping">
          Free worldwide. Estimated transit times are guidelines, not guarantees.
          Customs duties for orders outside the EU are the customer's responsibility.
        </Section>
        <Section title="Returns">
          30 days from delivery for any reason. Item must be returned in original
          condition. Refunds processed within 7 business days of receipt.
        </Section>
        <Section title="Warranty">
          Two-year structural warranty against manufacturing defects. Does not cover
          damage from impact with cage walls, court surfaces, or normal cosmetic wear.
        </Section>
        <Section title="Liability">
          Padel is a contact sport. VÖLT is not liable for injury, property damage, or
          loss arising from use of the product. Play safely, warm up properly, wear
          eyewear when appropriate.
        </Section>
        <Section title="Governing law">
          These terms are governed by Swedish law. Disputes resolved in Stockholm
          courts.
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
