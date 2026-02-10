import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPatientsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminPatients.title"),
  description: getTranslation("meta.adminPatients.description"),
  robots: { index: false, follow: false },
};

export default function AdminPatientsPage() {
  return <AdminPatientsContent />;
}
