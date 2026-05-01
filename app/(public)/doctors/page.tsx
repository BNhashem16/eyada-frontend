import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";
import { DoctorsPageContent } from "@/features/doctors/components/doctors-page-content";

const BASE_URL = "https://clinics-eg.com";

export const metadata: Metadata = {
  title: getTranslation("meta.doctors.title"),
  description: getTranslation("meta.doctors.description"),
  keywords: getTranslation("meta.doctors.keywords").split(", "),
  openGraph: {
    title: getTranslation("meta.doctors.title"),
    description: getTranslation("meta.doctors.description"),
    url: `${BASE_URL}/doctors`,
  },
  alternates: {
    canonical: `${BASE_URL}/doctors`,
  },
};

const doctorsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: getTranslation("meta.doctors.title"),
  description: getTranslation("meta.doctors.description"),
  url: `${BASE_URL}/doctors`,
  isPartOf: {
    "@type": "WebSite",
    name: getTranslation("seo.siteName"),
    url: BASE_URL,
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: getTranslation("seo.breadcrumbs.home"),
      item: BASE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: getTranslation("seo.breadcrumbs.doctors"),
      item: `${BASE_URL}/doctors`,
    },
  ],
};

export default async function DoctorsPage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <JsonLd data={doctorsJsonLd} nonce={nonce} />
      <JsonLd data={breadcrumbJsonLd} nonce={nonce} />
      <Suspense>
        <DoctorsPageContent />
      </Suspense>
    </>
  );
}
