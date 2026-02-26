import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyDashboardContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.pharmacyDashboard.title"),
  description: getTranslation("meta.pharmacyDashboard.description"),
  robots: { index: false, follow: false },
};

export default function PharmacyDashboardPage() {
  return <PharmacyDashboardContent />;
}
