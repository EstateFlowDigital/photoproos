import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://photoproos.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/galleries/",
          "/clients/",
          "/scheduling/",
          "/payments/",
          "/settings/",
          "/api/",
          "/g/*/", // Public gallery pages should be noindex (private content)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
