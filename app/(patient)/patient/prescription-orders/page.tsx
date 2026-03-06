import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PrescriptionOrdersPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("prescription.myOrders"),
  robots: { index: false, follow: false },
};

export default function PrescriptionOrdersPage() {
  return <PrescriptionOrdersPageContent />;
}
