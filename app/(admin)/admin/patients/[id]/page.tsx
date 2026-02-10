import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPatientDetailsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminPatientDetails.title"),
  description: getTranslation("meta.adminPatientDetails.description"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPatientDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminPatientDetailsContent patientId={id} />;
}
