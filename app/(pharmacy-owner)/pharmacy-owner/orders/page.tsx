import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyOrdersContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.pharmacyOrders.title"),
  description: getTranslation("meta.pharmacyOrders.description"),
  robots: { index: false, follow: false },
};

export default function PharmacyOrdersPage() {
  return <PharmacyOrdersContent />;
}
