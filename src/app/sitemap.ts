import type { MetadataRoute } from "next";
import { projects, publishedPosts } from "@/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  });
  return [
    page("/", 1),
    page("/quick", 0.9),
    page("/resume", 0.8),
    ...projects.map((p) => page(`/work/${p.slug}`, 0.7)),
    page("/log", 0.5),
    ...publishedPosts.map((p) => page(`/log/${p.slug}`, 0.4)),
  ];
}
