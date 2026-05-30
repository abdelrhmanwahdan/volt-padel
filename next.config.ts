import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export — builds the entire site to ./out, no server runtime needed.
  // Compatible with Cloudflare Pages, GitHub Pages, any static host.
  output: "export",
  images: {
    // next/image optimizer requires a server runtime, so disable it for static export.
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
