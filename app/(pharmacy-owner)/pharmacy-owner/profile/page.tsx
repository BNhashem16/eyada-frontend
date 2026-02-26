import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyOwnerProfileContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.pharmacyOwnerProfile.title"),
  description: getTranslation("meta.pharmacyOwnerProfile.description"),
  robots: { index: false, follow: false },
};

export default function PharmacyOwnerProfilePage() {
  return <PharmacyOwnerProfileContent />;
}
