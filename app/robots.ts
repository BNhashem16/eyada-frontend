import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allow = [
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
  ];

  const disallow = [
    "/admin/",
    "/doctor/",
    "/patient/",
    "/secretary/",
    "/driver/",
    "/pharmacy-owner/",
    "/api/",
    "/login",
    "/register",
    "/forgot-password",
  ];

  return {
    rules: [
      { userAgent: "*", allow, disallow },
      { userAgent: "Googlebot", allow, disallow },
    ],
    sitemap: "https://clinics-eg.com/sitemap.xml",
  };
}
