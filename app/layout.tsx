import type { Metadata } from "next";
import { Barlow_Condensed, Chivo, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import "./globals.css";

// Athletic Performance pairing — Barlow Condensed (compressed, fast, athletic)
// for display, Chivo (clean, neutral) for body, JetBrains Mono for technical labels.
const heading = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});
const body = Chivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-numeric",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "VÖLT — Charged Padel", template: "%s · VÖLT" },
  description:
    "VÖLT Pro 3K. A carbon-fiber padel racket engineered for control players who attack on demand.",
  metadataBase: new URL("https://volt.example.com"),
  openGraph: {
    title: "VÖLT — Charged Padel",
    description: "Engineered for control. Charged for impact.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <link
          rel="preload"
          as="image"
          href="/hero/desktop/frame_0001.webp"
          type="image/webp"
        />
        <link rel="preload" as="image" href="/posters/hero.webp" type="image/webp" />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-fg antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
