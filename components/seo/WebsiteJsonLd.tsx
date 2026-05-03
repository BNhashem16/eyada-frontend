import { getTranslation } from "@/lib/i18n";

interface WebsiteJsonLdProps {
  nonce?: string;
}

/**
 * Global JSON-LD structured data injected into every page via the root layout.
 * Tells search engines about the site and the medical organisation behind it,
 * which improves E-E-A-T signals and enables sitelinks search-box eligibility.
 */
export function WebsiteJsonLd({ nonce }: WebsiteJsonLdProps = {}) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://clinics-eg.com/#website",
    name: getTranslation("seo.brandNameShort", "ar"),
    alternateName: [
      getTranslation("seo.alternateNameLatin", "en"),
      getTranslation("seo.alternateNameClinicsEg", "en"),
      getTranslation("seo.alternateNameAr", "ar"),
    ],
    url: "https://clinics-eg.com",
    inLanguage: ["ar-EG", "en-US"],
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://clinics-eg.com/doctors?search={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": "https://clinics-eg.com/#organization",
    name: getTranslation("seo.organizationName", "ar"),
    alternateName: getTranslation("seo.organizationAlternateName", "en"),
    url: "https://clinics-eg.com",
    logo: {
      "@type": "ImageObject",
      url: "https://clinics-eg.com/icon.png",
      width: 512,
      height: 512,
    },
    description: getTranslation("seo.organizationDescription", "ar"),
    areaServed: {
      "@type": "Country",
      name: getTranslation("seo.country", "en"),
      "@id": "https://www.wikidata.org/wiki/Q79",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: getTranslation("seo.contactType", "en"),
      availableLanguage: [
        getTranslation("seo.langArabic", "en"),
        getTranslation("seo.langEnglish", "en"),
      ],
      url: "https://clinics-eg.com/contact",
    },
    serviceType: [
      getTranslation("seo.serviceTypeDoctorBooking", "en"),
      getTranslation("seo.serviceTypeClinicBooking", "en"),
      getTranslation("seo.serviceTypeReferral", "en"),
      getTranslation("seo.serviceTypePharmacyDelivery", "en"),
    ],
    knowsAbout: [
      getTranslation("seo.knowsAboutAppointments", "en"),
      getTranslation("seo.knowsAboutDoctorBooking", "en"),
      getTranslation("seo.knowsAboutClinicManagement", "en"),
      getTranslation("seo.knowsAboutDoctorBookingAr", "ar"),
      getTranslation("seo.knowsAboutEgyptianClinics", "ar"),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
    </>
  );
}
