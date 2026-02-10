import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PrivacyPageContent } from "@/components/legal/privacy-page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.privacy.title"),
  description: getTranslation("meta.privacy.description"),
  openGraph: {
    title: getTranslation("meta.privacy.title"),
    description: getTranslation("meta.privacy.description"),
    url: "https://clinics-eg.com/privacy",
  },
  alternates: {
    canonical: "https://clinics-eg.com/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
