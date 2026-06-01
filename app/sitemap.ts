import type { MetadataRoute } from "next";

// Static export requires every route — including metadata routes — to be
// pre-rendered. Pin this one to force-static so the build doesn't try to
// serve it as a runtime function.
export const dynamic = "force-static";

const BASE = "https://volt.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { url: "", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/product", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/technology", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/contact", priority: 0.4, changeFrequency: "monthly" as const },
    { url: "/legal/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { url: "/legal/terms", priority: 0.2, changeFrequency: "yearly" as const },
  ];
  return routes.map((r) => ({
    url: `${BASE}${r.url}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
