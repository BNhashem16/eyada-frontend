import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { CreatePharmacyContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.pharmacyDashboard.title"),
  description: getTranslation("meta.pharmacyDashboard.description"),
  robots: { index: false, follow: false },
};

export default function CreatePharmacyPage() {
  return <CreatePharmacyContent />;
}
