import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/doctors", "/clinics", "/specialties", "/feedback", "/track"],
        disallow: [
          "/admin/",
          "/doctor/",
          "/patient/",
          "/secretary/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://clinics-eg.com/sitemap.xml",
  };
}
