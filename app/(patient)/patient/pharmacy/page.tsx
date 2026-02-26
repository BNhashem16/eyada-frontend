import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.pharmacyBrowse"),
  description: getTranslation("pharmacyOwner.browseProducts"),
  robots: { index: false, follow: false },
};

export default function PharmacyPage() {
  return <PharmacyPageContent />;
}
