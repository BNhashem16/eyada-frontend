import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/doctors",
          "/doctors/",
          "/clinics",
          "/clinics/",
          "/specialties",
          "/feedback",
          "/track",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/admin/",
          "/doctor/",
          "/patient/",
          "/secretary/",
          "/api/",
          "/login",
          "/register",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/doctors",
          "/doctors/",
          "/clinics",
          "/clinics/",
          "/specialties",
          "/feedback",
          "/track",
          "/privacy",
          "/terms",
        ],
        disallow: ["/admin/", "/doctor/", "/patient/", "/secretary/", "/api/"],
      },
    ],
    sitemap: "https://clinics-eg.com/sitemap.xml",
  };
}
