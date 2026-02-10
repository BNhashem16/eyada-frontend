import { Metadata } from "next";
import { DoctorProfileComponent } from "@/features/doctors";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: getTranslation("meta.doctorProfile.title"),
  description: getTranslation("meta.doctorProfile.description"),
  openGraph: {
    title: getTranslation("meta.doctorProfile.title"),
    description: getTranslation("meta.doctorProfile.description"),
  },
};

const physicianJsonLd = {
  "@context": "https://schema.org",
  "@type": "Physician",
  description: getTranslation("meta.doctorProfile.description"),
  isPartOf: {
    "@type": "WebSite",
    name: "عيادة - Eyada",
    url: "https://clinics-eg.com",
  },
};

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params;

  return (
    <>
      <JsonLd data={physicianJsonLd} />
      <div className="container mx-auto px-4 py-8">
        <DoctorProfileComponent doctorId={id} />
      </div>
    </>
  );
}
