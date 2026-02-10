import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PatientFamilyContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.patientFamily.title"),
  description: getTranslation("meta.patientFamily.description"),
  robots: { index: false, follow: false },
};

export default function PatientFamilyPage() {
  return <PatientFamilyContent />;
}
