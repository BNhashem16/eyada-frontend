import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyOwnerPharmaciesContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.pharmacyDashboard.title"),
  description: getTranslation("meta.pharmacyDashboard.description"),
  robots: { index: false, follow: false },
};

export default function PharmacyOwnerPharmaciesPage() {
  return <PharmacyOwnerPharmaciesContent />;
}
