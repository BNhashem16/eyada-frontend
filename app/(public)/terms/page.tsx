import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { TermsPageContent } from "@/components/legal/terms-page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.terms.title"),
  description: getTranslation("meta.terms.description"),
  openGraph: {
    title: getTranslation("meta.terms.title"),
    description: getTranslation("meta.terms.description"),
    url: "https://clinics-eg.com/terms",
  },
  alternates: {
    canonical: "https://clinics-eg.com/terms",
  },
};

export default function TermsPage() {
  return <TermsPageContent />;
}
