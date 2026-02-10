import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { EditClinicContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorClinicEdit.title"),
  description: getTranslation("meta.doctorClinicEdit.description"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClinicPage({ params }: PageProps) {
  const { id } = await params;

  return <EditClinicContent clinicId={id} />;
}
