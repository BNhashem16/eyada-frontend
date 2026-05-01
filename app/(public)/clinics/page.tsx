import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";
import { ClinicsPageContent } from "@/features/clinics/components/clinics-page-content";

const BASE_URL = "https://clinics-eg.com";

export const metadata: Metadata = {
  title: getTranslation("meta.clinics.title"),
  description: getTranslation("meta.clinics.description"),
  keywords: getTranslation("meta.clinics.keywords").split(", "),
  openGraph: {
    title: getTranslation("meta.clinics.title"),
    description: getTranslation("meta.clinics.description"),
    url: `${BASE_URL}/clinics`,
  },
  alternates: {
    canonical: `${BASE_URL}/clinics`,
  },
};

const clinicsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: getTranslation("meta.clinics.title"),
  description: getTranslation("meta.clinics.description"),
  url: `${BASE_URL}/clinics`,
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
      name: getTranslation("seo.breadcrumbs.clinics"),
      item: `${BASE_URL}/clinics`,
    },
  ],
};

export default function ClinicsPage() {
  return (
    <>
      <JsonLd data={clinicsJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <ClinicsPageContent />
    </>
  );
}
