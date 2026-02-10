import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { SpecialtiesPageContent } from "@/features/specialties/components/specialties-page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.specialties.title"),
  description: getTranslation("meta.specialties.description"),
  keywords: getTranslation("meta.specialties.keywords").split(", "),
  openGraph: {
    title: getTranslation("meta.specialties.title"),
    description: getTranslation("meta.specialties.description"),
    url: "https://clinics-eg.com/specialties",
  },
  alternates: {
    canonical: "https://clinics-eg.com/specialties",
  },
};

export default function SpecialtiesPage() {
  return <SpecialtiesPageContent />;
}
