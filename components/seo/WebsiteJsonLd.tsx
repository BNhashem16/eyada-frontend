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
    name: "عيادة",
    alternateName: ["Eyada", "Clinics EG", "عيادة - حجز مواعيد طبية"],
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
    name: "عيادة - منصة حجز المواعيد الطبية",
    alternateName: "Eyada Medical Clinic Booking Platform",
    url: "https://clinics-eg.com",
    logo: {
      "@type": "ImageObject",
      url: "https://clinics-eg.com/icon.png",
      width: 512,
      height: 512,
    },
    description:
      "منصة لحجز مواعيد الأطباء والعيادات في مصر بكل سهولة وأمان",
    areaServed: {
      "@type": "Country",
      name: "Egypt",
      "@id": "https://www.wikidata.org/wiki/Q79",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Arabic", "English"],
      url: "https://clinics-eg.com/contact",
    },
    serviceType: [
      "Doctor Appointment Booking",
      "Clinic Booking",
      "Medical Specialist Referral",
      "Pharmacy Prescription Delivery",
    ],
    knowsAbout: [
      "Medical Appointments",
      "Doctor Booking",
      "Clinic Management",
      "حجز طبيب",
      "عيادات مصر",
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
