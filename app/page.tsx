import { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";
import { HomePageContent } from "@/components/home/home-page-content";

const BASE_URL = "https://clinics-eg.com";

export const metadata: Metadata = {
  title: getTranslation("meta.home.title"),
  description: getTranslation("meta.home.description"),
  keywords: getTranslation("meta.home.keywords").split(", "),
  openGraph: {
    title: getTranslation("meta.home.title"),
    description: getTranslation("meta.home.description"),
    url: BASE_URL,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: getTranslation("seo.siteName"),
  url: BASE_URL,
  description: getTranslation("meta.home.description"),
  inLanguage: ["ar", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/doctors?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const medicalBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: getTranslation("seo.siteName"),
  url: BASE_URL,
  description: getTranslation("meta.defaultDescription"),
  logo: `${BASE_URL}/opengraph-image`,
  areaServed: {
    "@type": "Country",
    name: getTranslation("seo.country"),
  },
  serviceType: getTranslation("seo.serviceType"),
  availableLanguage: [
    {
      "@type": "Language",
      name: getTranslation("seo.langArabic"),
      alternateName: "ar",
    },
    {
      "@type": "Language",
      name: getTranslation("seo.langEnglish"),
      alternateName: "en",
    },
  ],
  sameAs: [BASE_URL],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: getTranslation("seo.faq.q1"),
      acceptedAnswer: {
        "@type": "Answer",
        text: getTranslation("seo.faq.a1"),
      },
    },
    {
      "@type": "Question",
      name: getTranslation("seo.faq.q2"),
      acceptedAnswer: {
        "@type": "Answer",
        text: getTranslation("seo.faq.a2"),
      },
    },
    {
      "@type": "Question",
      name: getTranslation("seo.faq.q3"),
      acceptedAnswer: {
        "@type": "Answer",
        text: getTranslation("seo.faq.a3"),
      },
    },
    {
      "@type": "Question",
      name: getTranslation("seo.faq.q4"),
      acceptedAnswer: {
        "@type": "Answer",
        text: getTranslation("seo.faq.a4"),
      },
    },
    {
      "@type": "Question",
      name: getTranslation("seo.faq.q5"),
      acceptedAnswer: {
        "@type": "Answer",
        text: getTranslation("seo.faq.a5"),
      },
    },
  ],
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
  ],
};

export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <JsonLd data={websiteJsonLd} nonce={nonce} />
      <JsonLd data={medicalBusinessJsonLd} nonce={nonce} />
      <JsonLd data={faqJsonLd} nonce={nonce} />
      <JsonLd data={breadcrumbJsonLd} nonce={nonce} />
      <HomePageContent />
    </>
  );
}
