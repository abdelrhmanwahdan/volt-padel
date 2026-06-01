"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart, useCartHydrated } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Zap,
  Home,
  Cpu,
  BookOpen,
  HelpCircle,
} from "lucide-react";

const LINKS = [
  { href: "/product", label: "Shop" },
  { href: "/technology", label: "Technology" },
  { href: "/about", label: "Story" },
  { href: "/faq", label: "FAQ" },
];

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/product", label: "Shop", Icon: ShoppingBag },
  { href: "/technology", label: "Tech", Icon: Cpu },
  { href: "/about", label: "Story", Icon: BookOpen },
  { href: "/faq", label: "FAQ", Icon: HelpCircle },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const hydrated = useCartHydrated();
  const totalItems = useCart((s) => s.totalItems());
  // Only trust the count after the persist middleware has rehydrated from
  // localStorage — otherwise SSR sees 0 and the client sees N, which trips
  // React 19's hydration mismatch warning.
  const displayCount = hydrated ? totalItems : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top header — logo + cart on all viewports, full link row on desktop */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-bg/80 backdrop-blur-xl border-b border-border"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <nav className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" aria-label="VÖLT — home">
            <Zap
              className="w-4 h-4 text-accent transition-transform group-hover:scale-125"
              fill="currentColor"
              aria-hidden
            />
            <span className="font-display text-xl tracking-[-0.04em] font-black">VÖLT</span>
          </Link>
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-fg-muted">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-fg transition-colors py-1">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              aria-label={
                displayCount > 0
                  ? `Cart, ${displayCount} item${displayCount > 1 ? "s" : ""}`
                  : "Cart"
              }
              className="relative h-9 px-3 flex items-center gap-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} aria-hidden />
              {displayCount > 0 && (
                <span className="text-xs font-mono tabular-nums">{displayCount}</span>
              )}
            </Link>
            <Link
              href="/product#configure"
              className="hidden sm:inline-flex h-9 px-4 items-center rounded-full bg-accent text-bg text-sm font-semibold hover:bg-fg transition-colors"
            >
              Buy
            </Link>
          </div>
        </nav>
      </header>

      {/* Facebook-style bottom tab bar — mobile only */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-bg/95 backdrop-blur-xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <ul className="grid grid-cols-5 h-16">
          {TABS.map(({ href, label, Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium tracking-wide transition-colors",
                    active
                      ? "text-accent"
                      : "text-fg-muted hover:text-fg active:text-fg",
                  )}
                >
                  <Icon
                    className="w-5 h-5"
                    strokeWidth={active ? 2.25 : 1.75}
                    aria-hidden
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
