import type { MetadataRoute } from "next";

const baseUrl = "https://clinics-eg.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchDoctorIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/doctors?limit=500&page=1`, {
      next: { revalidate: 3600 },
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
    },
    {
      url: `${baseUrl}/doctors`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/clinics`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/specialties`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const doctorPages: MetadataRoute.Sitemap = doctorIds.map((id) => ({
    url: `${baseUrl}/doctors/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const clinicPages: MetadataRoute.Sitemap = clinicIds.map((id) => ({
    url: `${baseUrl}/clinics/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...doctorPages, ...clinicPages];
}
