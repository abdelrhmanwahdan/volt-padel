import Link from "next/link";
import { Zap } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/product", label: "Pro 3K" },
      { href: "/technology", label: "Technology" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Brand",
    links: [
      { href: "/about", label: "Story" },
      { href: "/about#manifesto", label: "Manifesto" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/contact#shipping", label: "Shipping & Returns" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" fill="currentColor" />
              <span className="font-display text-xl tracking-[-0.04em] font-black">VÖLT</span>
            </Link>
            <p className="mt-4 text-sm text-fg-muted leading-relaxed max-w-[18ch]">
              Charged for control. Engineered for impact.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-eyebrow mb-4">{col.title}</p>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-fg-muted hover:text-fg transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs text-fg-faint font-mono">
          <p>© {new Date().getFullYear()} VÖLT Padel — All rights reserved.</p>
          <p className="tracking-[0.3em] uppercase">Engineered in Stockholm · Tested in Marbella</p>
        </div>
      </div>
    </footer>
  );
}
