import { Metadata } from "next";
import { Suspense } from "react";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";
import { DoctorsPageContent } from "@/features/doctors/components/doctors-page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctors.title"),
  description: getTranslation("meta.doctors.description"),
  keywords: getTranslation("meta.doctors.keywords").split(", "),
  openGraph: {
    title: getTranslation("meta.doctors.title"),
    description: getTranslation("meta.doctors.description"),
    url: "https://clinics-eg.com/doctors",
  },
  alternates: {
    canonical: "https://clinics-eg.com/doctors",
  },
};

const doctorsJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: getTranslation("meta.doctors.title"),
  description: getTranslation("meta.doctors.description"),
  url: "https://clinics-eg.com/doctors",
  isPartOf: {
    "@type": "WebSite",
    name: "عيادة - Eyada",
    url: "https://clinics-eg.com",
  },
};

export default function DoctorsPage() {
  return (
    <>
      <JsonLd data={doctorsJsonLd} />
      <Suspense>
        <DoctorsPageContent />
      </Suspense>
    </>
  );
}
