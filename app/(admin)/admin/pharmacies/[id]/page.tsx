import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPharmacyDetailsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminPharmacies.title"),
  description: getTranslation("meta.adminPharmacies.description"),
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPharmacyDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminPharmacyDetailsContent pharmacyId={id} />;
}
