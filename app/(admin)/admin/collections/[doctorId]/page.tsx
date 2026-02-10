import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminCollectionDetailsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminCollectionDetails.title"),
  description: getTranslation("meta.adminCollectionDetails.description"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ doctorId: string }>;
}

export default async function DoctorReportPage({ params }: PageProps) {
  const { doctorId } = await params;

  return <AdminCollectionDetailsContent doctorId={doctorId} />;
}
