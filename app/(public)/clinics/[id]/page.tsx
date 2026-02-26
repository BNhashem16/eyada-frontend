import { Metadata } from "next";
import { ClinicDetailsComponent } from "@/features/clinics";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";

const BASE_URL = "https://clinics-eg.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface ClinicPageProps {
  params: Promise<{ id: string }>;
}

interface ClinicData {
  id: string;
  name: { ar: string; en: string };
  description?: { ar: string; en: string };
  address: { ar: string; en: string };
  phoneNumbers: string[];
  images: string[];
  latitude?: number;
  longitude?: number;
  city?: {
    name: { ar: string; en: string };
    state?: { name: { ar: string; en: string } };
  };
  doctorProfile?: {
    user: { fullName: string };
    specialty: { name: { ar: string; en: string } };
    averageRating: number;
    totalRatings: number;
  };
  schedules?: {
    dayOfWeek: number;
    shifts: { startTime: string; endTime: string }[];
    isActive: boolean;
  }[];
  serviceTypes?: {
    name?: { ar: string; en: string };
    price: number | string;
  }[];
}

async function fetchClinic(id: string): Promise<ClinicData | null> {
  try {
    const res = await fetch(`${API_BASE}/clinics/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: ClinicPageProps): Promise<Metadata> {
  const { id } = await params;
  const clinic = await fetchClinic(id);

  if (!clinic) {
    return {
      title: getTranslation("meta.clinicDetails.title"),
      description: getTranslation("meta.clinicDetails.description"),
    };
  }

  const clinicName = clinic.name.ar;
  const doctorName = clinic.doctorProfile?.user?.fullName || "";
  const specialtyAr = clinic.doctorProfile?.specialty?.name?.ar || "";
  const cityName = clinic.city?.name?.ar || "";
  const stateName = clinic.city?.state?.name?.ar || "";
  const location = [cityName, stateName].filter(Boolean).join("، ");
  const drPrefix = getTranslation("seo.doctorPrefix");

  const titleAr = doctorName
    ? `${getTranslation("seo.clinicKeyword")} ${drPrefix} ${doctorName} - ${specialtyAr}${location ? ` في ${location}` : ""}`
    : `${clinicName}${location ? ` - ${location}` : ""}`;

  const descriptionAr = clinic.description?.ar
    ? `${clinic.description.ar.substring(0, 150)}... ${getTranslation("seo.bookAppointment")}.`
    : `${getTranslation("seo.bookAppointment")} ${clinicName}${doctorName ? ` - ${drPrefix} ${doctorName}` : ""}${specialtyAr ? ` - ${specialtyAr}` : ""}${location ? ` في ${location}` : ""}.`;

  const url = `${BASE_URL}/clinics/${id}`;

  return {
    title: titleAr,
    description: descriptionAr,
    keywords: [
      clinicName,
      doctorName ? `${drPrefix} ${doctorName}` : "",
      specialtyAr,
      cityName,
      getTranslation("seo.clinicKeyword"),
      getTranslation("seo.bookAppointment"),
    ].filter(Boolean),
    openGraph: {
      title: titleAr,
      description: descriptionAr,
      url,
      type: "website",
      ...(clinic.images?.[0] && {
        images: [{ url: clinic.images[0], alt: clinicName }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: titleAr,
      description: descriptionAr,
    },
    alternates: {
      canonical: url,
    },
  };
}

const DAYS = [
  getTranslation("days.sunday"),
  getTranslation("days.monday"),
  getTranslation("days.tuesday"),
  getTranslation("days.wednesday"),
  getTranslation("days.thursday"),
  getTranslation("days.friday"),
  getTranslation("days.saturday"),
];

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { id } = await params;
  const clinic = await fetchClinic(id);

  const clinicName = clinic?.name?.ar || "";
  const doctorName = clinic?.doctorProfile?.user?.fullName || "";
  const specialtyEn = clinic?.doctorProfile?.specialty?.name?.en || "";

  const clinicJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: clinicName,
    description:
      clinic?.description?.ar ||
      getTranslation("meta.clinicDetails.description"),
    url: `${BASE_URL}/clinics/${id}`,
    ...(clinic?.phoneNumbers?.[0] && { telephone: clinic.phoneNumbers[0] }),
    ...(clinic?.images?.[0] && { image: clinic.images[0] }),
    medicalSpecialty: specialtyEn,
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic?.address?.ar,
      addressLocality: clinic?.city?.name?.ar,
      addressRegion: clinic?.city?.state?.name?.ar,
      addressCountry: "EG",
    },
    ...(clinic?.latitude &&
      clinic?.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: clinic.latitude,
          longitude: clinic.longitude,
        },
      }),
    ...(clinic?.doctorProfile?.averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: clinic.doctorProfile.averageRating,
        ratingCount: clinic.doctorProfile.totalRatings,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    isPartOf: {
      "@type": "WebSite",
      name: getTranslation("seo.siteName"),
      url: BASE_URL,
    },
  };

  // Add opening hours
  if (clinic?.schedules?.length) {
    clinicJsonLd.openingHoursSpecification = clinic.schedules
      .filter((s) => s.isActive && s.shifts?.length)
      .map((schedule) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAYS[schedule.dayOfWeek] || schedule.dayOfWeek,
        opens: schedule.shifts[0]?.startTime,
        closes: schedule.shifts[schedule.shifts.length - 1]?.endTime,
      }));
  }

  // Add price range
  if (clinic?.serviceTypes?.length) {
    const prices = clinic.serviceTypes
      .map((s) => Number(s.price))
      .filter((p) => p > 0);
    if (prices.length) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      clinicJsonLd.priceRange = `${minPrice} - ${maxPrice} EGP`;
    }
  }

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
      {
        "@type": "ListItem",
        position: 3,
        name: clinicName || getTranslation("seo.breadcrumbs.clinic"),
        item: `${BASE_URL}/clinics/${id}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={clinicJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="container mx-auto px-4 py-8">
        <ClinicDetailsComponent clinicId={id} />
      </div>
    </>
  );
}
