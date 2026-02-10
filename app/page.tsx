import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";
import { HomePageContent } from "@/components/home/home-page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.home.title"),
  description: getTranslation("meta.home.description"),
  keywords: getTranslation("meta.home.keywords").split(", "),
  openGraph: {
    title: getTranslation("meta.home.title"),
    description: getTranslation("meta.home.description"),
    url: "https://clinics-eg.com",
  },
  alternates: {
    canonical: "https://clinics-eg.com",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "عيادة - Eyada",
  url: "https://clinics-eg.com",
  description: getTranslation("meta.home.description"),
  inLanguage: ["ar", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: "https://clinics-eg.com/doctors?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const medicalBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "عيادة - Eyada",
  url: "https://clinics-eg.com",
  description: getTranslation("meta.defaultDescription"),
  areaServed: {
    "@type": "Country",
    name: "Egypt",
  },
  serviceType: "Medical Appointment Booking",
  availableLanguage: [
    { "@type": "Language", name: "Arabic" },
    { "@type": "Language", name: "English" },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={medicalBusinessJsonLd} />
      <HomePageContent />
    </>
  );
}
