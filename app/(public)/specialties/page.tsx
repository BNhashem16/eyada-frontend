import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";
import { SpecialtiesPageContent } from "@/features/specialties/components/specialties-page-content";

const BASE_URL = "https://clinics-eg.com";

export const metadata: Metadata = {
  title: getTranslation("meta.specialties.title"),
  description: getTranslation("meta.specialties.description"),
  keywords: getTranslation("meta.specialties.keywords").split(", "),
  openGraph: {
    title: getTranslation("meta.specialties.title"),
    description: getTranslation("meta.specialties.description"),
    url: `${BASE_URL}/specialties`,
  },
  alternates: {
    canonical: `${BASE_URL}/specialties`,
  },
};

const specialtiesJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: getTranslation("meta.specialties.title"),
  description: getTranslation("meta.specialties.description"),
  url: `${BASE_URL}/specialties`,
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
      name: getTranslation("seo.breadcrumbs.specialties"),
      item: `${BASE_URL}/specialties`,
    },
  ],
};

export default function SpecialtiesPage() {
  return (
    <>
      <JsonLd data={specialtiesJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SpecialtiesPageContent />
    </>
  );
}
