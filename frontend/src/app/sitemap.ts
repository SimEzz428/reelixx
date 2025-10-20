import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/studio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/examples`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}