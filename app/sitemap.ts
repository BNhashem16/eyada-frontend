import type { MetadataRoute } from "next";

const baseUrl = "https://clinics-eg.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Both language variants for bilingual hreflang support.
// Google uses these to serve the correct language version in search results.
function langAlternates(path: string) {
  const url = `${baseUrl}${path}`;
  return {
    languages: {
      "ar-EG": url,
      "en-US": url,
      "x-default": url,
    },
  };
}

async function fetchDoctorIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/doctors?limit=500&page=1`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json.data?.items || json.items || [];
    return items.map((d: { id: string }) => d.id);
  } catch {
    return [];
  }
}

async function fetchClinicIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/clinics?limit=500&page=1`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json.data?.items || json.items || [];
    return items.map((c: { id: string }) => c.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [doctorIds, clinicIds] = await Promise.all([
    fetchDoctorIds(),
    fetchClinicIds(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: langAlternates("/"),
    },
    {
      url: `${baseUrl}/doctors`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: langAlternates("/doctors"),
    },
    {
      url: `${baseUrl}/clinics`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: langAlternates("/clinics"),
    },
    {
      url: `${baseUrl}/specialties`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: langAlternates("/specialties"),
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: langAlternates("/feedback"),
    },
    {
      url: `${baseUrl}/track`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: langAlternates("/track"),
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: langAlternates("/privacy"),
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: langAlternates("/terms"),
    },
  ];

  const doctorPages: MetadataRoute.Sitemap = doctorIds.map((id) => ({
    url: `${baseUrl}/doctors/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: langAlternates(`/doctors/${id}`),
  }));

  const clinicPages: MetadataRoute.Sitemap = clinicIds.map((id) => ({
    url: `${baseUrl}/clinics/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: langAlternates(`/clinics/${id}`),
  }));

  return [...staticPages, ...doctorPages, ...clinicPages];
}
