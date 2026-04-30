import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { DoctorProfileComponent } from "@/features/doctors";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";
import type { DoctorProfile } from "@/types";
import { PUBLIC_ENDPOINTS } from "@/lib/api/endpoints";

const BASE_URL = "https://clinics-eg.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

const fetchDoctor = cache(async (id: string): Promise<DoctorProfile | null> => {
  try {
    const res = await fetch(`${API_BASE}${PUBLIC_ENDPOINTS.DOCTOR(id)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as DoctorProfile;
  } catch {
    return null;
  }
});

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

  const name = doctor.user?.fullName ?? doctor.user?.name ?? "";
  const specialtyAr = doctor.specialty?.name?.ar || "";
  const specialtyEn = doctor.specialty?.name?.en || "";
  const bio = doctor.bio?.ar || "";
  const drPrefix = getTranslation("seo.doctorPrefix");

  const titleAr = `${drPrefix} ${name} - ${specialtyAr} | ${getTranslation("seo.bookAppointment")}`;
  const descriptionAr = bio
    ? `${bio.substring(0, 150)}... ${getTranslation("seo.bookAppointment")} ${drPrefix} ${name}.`
    : `${getTranslation("seo.bookAppointment")} ${drPrefix} ${name} - ${specialtyAr}.`;

  const url = `${BASE_URL}/doctors/${id}`;

  return {
    title: titleAr,
    description: descriptionAr,
    keywords: [
      `${drPrefix} ${name}`,
      specialtyAr,
      specialtyEn,
      getTranslation("seo.bookAppointment"),
      getTranslation("seo.doctorKeyword"),
      getTranslation("seo.clinicKeyword"),
    ],
    openGraph: {
      title: titleAr,
      description: descriptionAr,
      url,
      type: "profile",
      ...(doctor.profileImage && {
        images: [{ url: doctor.profileImage, alt: `${drPrefix} ${name}` }],
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

  if (!doctor) {
    notFound();
  }

  // Pre-fill the React Query cache so the client component renders the
  // doctor (and its clinics tab) immediately with no skeleton flash.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["doctor", id],
    queryFn: () => Promise.resolve(doctor),
  });

  const dehydratedState = dehydrate(queryClient);

  const name = doctor.user?.fullName ?? doctor.user?.name ?? "";
  const specialtyAr = doctor.specialty?.name?.ar || "";
  const specialtyEn = doctor.specialty?.name?.en || "";

  const drPrefix = getTranslation("seo.doctorPrefix");
  const physicianJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: name ? `${drPrefix} ${name}` : undefined,
    description:
      doctor.bio?.ar || getTranslation("meta.doctorProfile.description"),
    url: `${BASE_URL}/doctors/${id}`,
    medicalSpecialty: specialtyEn || specialtyAr,
    ...(doctor.profileImage && { image: doctor.profileImage }),
    ...(doctor.averageRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: doctor.averageRating,
        ratingCount: doctor.totalRatings,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(doctor.yearsOfExperience && {
      yearsOfExperience: doctor.yearsOfExperience,
    }),
    isPartOf: {
      "@type": "WebSite",
      name: getTranslation("seo.siteName"),
      url: BASE_URL,
    },
  };

  if (doctor.clinics?.length) {
    physicianJsonLd.workLocation = doctor.clinics.map((clinic) => ({
      "@type": "MedicalClinic",
      name: clinic.name?.ar,
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.address?.ar,
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
        name: getTranslation("seo.breadcrumbs.home"),
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: getTranslation("seo.breadcrumbs.doctors"),
        item: `${BASE_URL}/doctors`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: name
          ? `${drPrefix} ${name}`
          : getTranslation("seo.breadcrumbs.doctor"),
        item: `${BASE_URL}/doctors/${id}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={physicianJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <HydrationBoundary state={dehydratedState}>
          <DoctorProfileComponent doctorId={id} />
        </HydrationBoundary>
      </div>
    </>
  );
}
