import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPharmaciesContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminPharmacies.title"),
  description: getTranslation("meta.adminPharmacies.description"),
  robots: { index: false, follow: false },
};

export default function AdminPharmaciesPage() {
  return <AdminPharmaciesContent />;
}
