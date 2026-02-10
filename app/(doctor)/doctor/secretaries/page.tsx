import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DoctorSecretariesContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorSecretaries.title"),
  description: getTranslation("meta.doctorSecretaries.description"),
  robots: { index: false, follow: false },
};

export default function DoctorSecretariesPage() {
  return <DoctorSecretariesContent />;
}
