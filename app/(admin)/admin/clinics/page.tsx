import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminClinicsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminClinics.title"),
  description: getTranslation("meta.adminClinics.description"),
  robots: { index: false, follow: false },
};

export default function AdminClinicsPage() {
  return <AdminClinicsContent />;
}
