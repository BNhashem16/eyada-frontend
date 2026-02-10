import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PatientProfileContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.patientProfile.title"),
  description: getTranslation("meta.patientProfile.description"),
  robots: { index: false, follow: false },
};

export default function PatientProfilePage() {
  return <PatientProfileContent />;
}
