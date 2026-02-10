import { Metadata } from "next";
import { ClinicDetailsComponent } from "@/features/clinics";
import { getTranslation } from "@/lib/i18n";
import { JsonLd } from "@/components/seo/json-ld";

interface ClinicPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: getTranslation("meta.clinicDetails.title"),
  description: getTranslation("meta.clinicDetails.description"),
  openGraph: {
    title: getTranslation("meta.clinicDetails.title"),
    description: getTranslation("meta.clinicDetails.description"),
  },
};

const clinicJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  description: getTranslation("meta.clinicDetails.description"),
  isPartOf: {
    "@type": "WebSite",
    name: "عيادة - Eyada",
    url: "https://clinics-eg.com",
  },
};

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { id } = await params;

  return (
    <>
      <JsonLd data={clinicJsonLd} />
      <div className="container mx-auto px-4 py-8">
        <ClinicDetailsComponent clinicId={id} />
      </div>
    </>
  );
}
