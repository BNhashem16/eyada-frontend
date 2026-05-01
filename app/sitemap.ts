import type { MetadataRoute } from "next";

const baseUrl = "https://clinics-eg.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Hard caps so a misbehaving backend cannot stall a sitemap regeneration past
// Vercel's serverless function budget.
const PAGE_SIZE = 500;
const MAX_PAGES = 20; // up to 10,000 entities per type
const FETCH_TIMEOUT_MS = 10_000;

// Both language variants for bilingual hreflang. Once the [locale] migration
// ships these will resolve to /ar and /en URLs respectively.
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

interface SitemapEntity {
  id: string;
  updatedAt?: string;
}

interface ListEnvelope {
  items?: Array<{ id: string; updatedAt?: string }>;
  total?: number;
}

async function fetchPaged(
  resource: string,
  label: string,
): Promise<SitemapEntity[]> {
  const out: SitemapEntity[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    let res: Response;
    try {
      res = await fetch(
        `${API_BASE}/${resource}?limit=${PAGE_SIZE}&page=${page}`,
        {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        },
      );
    } catch (err) {
      console.error(`[sitemap] ${label} page ${page} fetch failed`, err);
      break;
    }

    if (!res.ok) {
      console.error(
        `[sitemap] ${label} page ${page} returned HTTP ${res.status}`,
      );
      break;
    }

    let json: { data?: ListEnvelope } & ListEnvelope;
    try {
      json = await res.json();
    } catch (err) {
      console.error(`[sitemap] ${label} page ${page} JSON parse failed`, err);
      break;
    }

    const envelope: ListEnvelope = json.data ?? json;
    const items = envelope.items ?? [];

    if (items.length === 0) break;

    for (const item of items) {
      if (item?.id) {
        out.push({ id: item.id, updatedAt: item.updatedAt });
      }
    }

    const total = envelope.total ?? out.length;
    if (out.length >= total) break;
  }

  if (out.length === 0) {
    console.error(
      `[sitemap] ${label}: no entries returned. Sitemap will omit ${label} URLs this regeneration.`,
    );
  }

  return out;
}

function entityEntry(
  path: string,
  entity: SitemapEntity,
): MetadataRoute.Sitemap[number] {
  const entry: MetadataRoute.Sitemap[number] = {
    url: `${baseUrl}${path}`,
    changeFrequency: "weekly",
    alternates: langAlternates(path),
  };
  if (entity.updatedAt) {
    const parsed = new Date(entity.updatedAt);
    if (!Number.isNaN(parsed.getTime())) {
      entry.lastModified = parsed;
    }
  }
  return entry;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [doctors, clinics] = await Promise.all([
    fetchPaged("doctors", "doctors"),
    fetchPaged("clinics", "clinics"),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      alternates: langAlternates("/"),
    },
    {
      url: `${baseUrl}/doctors`,
      lastModified: now,
      changeFrequency: "daily",
      alternates: langAlternates("/doctors"),
    },
    {
      url: `${baseUrl}/clinics`,
      lastModified: now,
      changeFrequency: "daily",
      alternates: langAlternates("/clinics"),
    },
    {
      url: `${baseUrl}/specialties`,
      lastModified: now,
      changeFrequency: "weekly",
      alternates: langAlternates("/specialties"),
    },
    {
      url: `${baseUrl}/feedback`,
      changeFrequency: "monthly",
      alternates: langAlternates("/feedback"),
    },
    {
      url: `${baseUrl}/track`,
      changeFrequency: "monthly",
      alternates: langAlternates("/track"),
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      alternates: langAlternates("/privacy"),
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      alternates: langAlternates("/terms"),
    },
  ];

  const doctorPages = doctors.map((d) => entityEntry(`/doctors/${d.id}`, d));
  const clinicPages = clinics.map((c) => entityEntry(`/clinics/${c.id}`, c));

  return [...staticPages, ...doctorPages, ...clinicPages];
}
