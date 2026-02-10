import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminDoctorsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminDoctors.title"),
  description: getTranslation("meta.adminDoctors.description"),
  robots: { index: false, follow: false },
};

export default function AdminDoctorsPage() {
  return <AdminDoctorsContent />;
}
