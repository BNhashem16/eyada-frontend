import { Metadata } from "next";
import { DoctorProfileComponent } from "@/features/doctors";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";

const BASE_URL = "https://clinics-eg.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

interface DoctorData {
  id: string;
  user: { fullName: string; phoneNumber?: string };
  specialty: { name: { ar: string; en: string } };
  bio?: { ar: string; en: string };
  qualifications?: { ar: string; en: string };
  averageRating: number;
  totalRatings: number;
  profileImage?: string;
  yearsOfExperience?: number;
  clinics?: {
    id: string;
    name: { ar: string; en: string };
    address: { ar: string; en: string };
    phoneNumbers: string[];
    city?: {
      name: { ar: string; en: string };
      state?: { name: { ar: string; en: string } };
    };
  }[];
}

async function fetchDoctor(id: string): Promise<DoctorData | null> {
  try {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
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
}: DoctorPageProps): Promise<Metadata> {
  const { id } = await params;
  const doctor = await fetchDoctor(id);

  if (!doctor) {
    return {
      title: getTranslation("meta.doctorProfile.title"),
      description: getTranslation("meta.doctorProfile.description"),
    };
  }

  const name = doctor.user.fullName;
  const specialtyAr = doctor.specialty?.name?.ar || "";
  const specialtyEn = doctor.specialty?.name?.en || "";
  const bio = doctor.bio?.ar || "";

  const titleAr = `د. ${name} - ${specialtyAr} | احجز موعدك الآن`;
  const descriptionAr = bio
    ? `${bio.substring(0, 150)}... احجز موعدك مع د. ${name} أونلاين.`
    : `احجز موعدك مع د. ${name} - ${specialtyAr}. شاهد التقييمات والعيادات المتاحة واحجز أونلاين.`;

  const url = `${BASE_URL}/doctors/${id}`;

  return {
    title: titleAr,
    description: descriptionAr,
    keywords: [
      `د. ${name}`,
      specialtyAr,
      specialtyEn,
      "حجز موعد",
      "دكتور",
      "عيادة",
    ],
    openGraph: {
      title: titleAr,
      description: descriptionAr,
      url,
      type: "profile",
      ...(doctor.profileImage && {
        images: [{ url: doctor.profileImage, alt: `د. ${name}` }],
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

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params;
  const doctor = await fetchDoctor(id);

  const name = doctor?.user?.fullName || "";
  const specialtyAr = doctor?.specialty?.name?.ar || "";
  const specialtyEn = doctor?.specialty?.name?.en || "";

  const physicianJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: name ? `د. ${name}` : undefined,
    description:
      doctor?.bio?.ar || getTranslation("meta.doctorProfile.description"),
    url: `${BASE_URL}/doctors/${id}`,
    medicalSpecialty: specialtyEn || specialtyAr,
    ...(doctor?.profileImage && { image: doctor.profileImage }),
    ...(doctor?.averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: doctor.averageRating,
        ratingCount: doctor.totalRatings,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(doctor?.yearsOfExperience && {
      yearsOfExperience: doctor.yearsOfExperience,
    }),
    isPartOf: {
      "@type": "WebSite",
      name: "عيادة - Eyada",
      url: BASE_URL,
    },
  };

  // Add clinic locations if available
  if (doctor?.clinics?.length) {
    physicianJsonLd.workLocation = doctor.clinics.map((clinic) => ({
      "@type": "MedicalClinic",
      name: clinic.name.ar,
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.address.ar,
        addressLocality: clinic.city?.name?.ar,
        addressRegion: clinic.city?.state?.name?.ar,
        addressCountry: "EG",
      },
      ...(clinic.phoneNumbers?.[0] && { telephone: clinic.phoneNumbers[0] }),
    }));
  }

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
      {
        "@type": "ListItem",
        position: 2,
        name: "الأطباء",
        item: `${BASE_URL}/doctors`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: name ? `د. ${name}` : "الطبيب",
        item: `${BASE_URL}/doctors/${id}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={physicianJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="container mx-auto px-4 py-8">
        <DoctorProfileComponent doctorId={id} />
      </div>
    </>
  );
}
