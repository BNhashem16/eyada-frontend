import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPrescriptionOrdersPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("nav.prescriptionOrders"),
  robots: { index: false, follow: false },
};

export default function AdminPrescriptionOrdersPage() {
  return <AdminPrescriptionOrdersPageContent />;
}
