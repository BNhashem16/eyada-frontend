import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPharmacyDashboardContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminPharmacyDashboard.title"),
  description: getTranslation("meta.adminPharmacyDashboard.description"),
  robots: { index: false, follow: false },
};

export default function AdminPharmacyDashboardPage() {
  return <AdminPharmacyDashboardContent />;
}
