import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { EditPharmacyContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.editPharmacyTitle"),
  description: getTranslation("pharmacyOwner.editPharmacySubtitle"),
  robots: { index: false, follow: false },
};

export default async function EditPharmacyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditPharmacyContent pharmacyId={id} />;
}
