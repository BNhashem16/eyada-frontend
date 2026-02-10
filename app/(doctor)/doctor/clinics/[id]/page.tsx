import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { ClinicManageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorClinicDetails.title"),
  description: getTranslation("meta.doctorClinicDetails.description"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClinicManagePage({ params }: PageProps) {
  const { id } = await params;

  return <ClinicManageContent clinicId={id} />;
}
