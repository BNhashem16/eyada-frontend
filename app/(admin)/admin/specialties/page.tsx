import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminSpecialtiesContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminSpecialties.title"),
  description: getTranslation("meta.adminSpecialties.description"),
  robots: { index: false, follow: false },
};

export default function AdminSpecialtiesPage() {
  return <AdminSpecialtiesContent />;
}
