import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { ClinicsPageContent } from "@/features/clinics/components/clinics-page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.clinics.title"),
  description: getTranslation("meta.clinics.description"),
  keywords: getTranslation("meta.clinics.keywords").split(", "),
  openGraph: {
    title: getTranslation("meta.clinics.title"),
    description: getTranslation("meta.clinics.description"),
    url: "https://clinics-eg.com/clinics",
  },
  alternates: {
    canonical: "https://clinics-eg.com/clinics",
  },
};

export default function ClinicsPage() {
  return <ClinicsPageContent />;
}
