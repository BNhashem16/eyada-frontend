import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyDriversContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.pharmacyDrivers.title"),
  description: getTranslation("meta.pharmacyDrivers.description"),
  robots: { index: false, follow: false },
};

export default function PharmacyDriversPage() {
  return <PharmacyDriversContent />;
}
