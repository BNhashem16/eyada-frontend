import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DoctorProfileContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorProfilePage.title"),
  description: getTranslation("meta.doctorProfilePage.description"),
  robots: { index: false, follow: false },
};

export default function DoctorProfilePage() {
  return <DoctorProfileContent />;
}
