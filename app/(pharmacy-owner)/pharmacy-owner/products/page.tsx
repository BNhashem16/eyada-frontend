import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyProductsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.pharmacyProducts.title"),
  description: getTranslation("meta.pharmacyProducts.description"),
  robots: { index: false, follow: false },
};

export default function PharmacyProductsPage() {
  return <PharmacyProductsContent />;
}
