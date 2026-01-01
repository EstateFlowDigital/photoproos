import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://photoproos.com";

  // Static marketing pages
  const staticPages = [
    "",
    "/pricing",
    "/about",
    "/contact",
    "/blog",
    "/help",
    "/changelog",
    "/roadmap",
    "/press",
    "/careers",
    "/partners",
    "/affiliates",
    "/guides",
    "/webinars",
  ];

  // Feature pages
  const featurePages = [
    "/features/galleries",
    "/features/payments",
    "/features/clients",
    "/features/automation",
    "/features/analytics",
    "/features/contracts",
  ];

  // Industry pages
  const industryPages = [
    "/industries/real-estate",
    "/industries/commercial",
    "/industries/architecture",
    "/industries/events",
    "/industries/portraits",
    "/industries/food",
  ];

  // Legal pages
  const legalPages = [
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
    "/legal/security",
    "/legal/dpa",
  ];

  // Auth pages (lower priority)
  const authPages = [
    "/sign-in",
    "/sign-up",
  ];

  const allPages = [
    ...staticPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...featurePages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...industryPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...legalPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...authPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];

  return allPages;
}
