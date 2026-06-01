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
  // Expose the build-time git ref to the client bundle so jsDelivr URLs are
  // pinned to the deployed commit. On Cloudflare Pages, CF_PAGES_COMMIT_SHA is
  // injected automatically per deploy — bumping the URL side-steps the 12h
  // jsDelivr cache without needing the purge API. NEXT_PUBLIC_MEDIA_REF wins
  // if explicitly set (e.g. a release tag).
  env: {
    NEXT_PUBLIC_MEDIA_REF:
      process.env.NEXT_PUBLIC_MEDIA_REF ||
      process.env.CF_PAGES_COMMIT_SHA ||
      "main",
  },
};

export default nextConfig;
