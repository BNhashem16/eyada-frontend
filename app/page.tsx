import { Metadata } from "next";
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
  name: "عيادة - Eyada",
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
  name: "عيادة - Eyada",
  url: BASE_URL,
  description: getTranslation("meta.defaultDescription"),
  logo: `${BASE_URL}/opengraph-image`,
  areaServed: {
    "@type": "Country",
    name: "Egypt",
  },
  serviceType: "Medical Appointment Booking",
  availableLanguage: [
    { "@type": "Language", name: "Arabic", alternateName: "ar" },
    { "@type": "Language", name: "English", alternateName: "en" },
  ],
  sameAs: [BASE_URL],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "كيف أحجز موعد مع دكتور على عيادة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يمكنك حجز موعد بسهولة من خلال البحث عن الطبيب أو التخصص المطلوب، ثم اختيار العيادة والموعد المناسب والضغط على زر الحجز. يمكنك الحجز أونلاين 24/7.",
      },
    },
    {
      "@type": "Question",
      name: "هل الحجز على عيادة مجاني؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، خدمة الحجز على منصة عيادة مجانية تماماً. تدفع فقط رسوم الكشف للطبيب عند زيارة العيادة.",
      },
    },
    {
      "@type": "Question",
      name: "كيف أتتبع موعدي على عيادة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "يمكنك تتبع موعدك من خلال صفحة تتبع المواعيد باستخدام رقم الحجز الخاص بك. ستعرف ترتيبك في قائمة الانتظار وحالة الموعد.",
      },
    },
    {
      "@type": "Question",
      name: "ما هي التخصصات الطبية المتاحة على عيادة؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "تتوفر على عيادة جميع التخصصات الطبية مثل الباطنة، الأطفال، العيون، العظام، الأسنان، الجلدية، القلب، النساء والتوليد، المخ والأعصاب، الأنف والأذن، وغيرها الكثير.",
      },
    },
    {
      "@type": "Question",
      name: "هل يمكنني إلغاء أو تعديل موعدي؟",
      acceptedAnswer: {
        "@type": "Answer",
        text: "نعم، يمكنك إلغاء أو تعديل موعدك من خلال حسابك على المنصة. سياسة الإلغاء تختلف حسب شروط كل عيادة.",
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
      name: "الرئيسية",
      item: BASE_URL,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={medicalBusinessJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <HomePageContent />
    </>
  );
}
