import { Metadata } from "next";
import { ClinicDetailsComponent } from "@/features/clinics";
import { getTranslation } from "@/lib/i18n";

interface ClinicPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: getTranslation("meta.clinicDetails.title"),
  description: getTranslation("meta.clinicDetails.description"),
};

export default async function ClinicPage({ params }: ClinicPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <ClinicDetailsComponent clinicId={id} />
    </div>
  );
}
