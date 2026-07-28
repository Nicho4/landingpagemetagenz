import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://metagenzbukitcarmel.vercel.app",
      priority: 1,
      changeFrequency: "weekly",
      lastModified: new Date(),
    },
  ];
}