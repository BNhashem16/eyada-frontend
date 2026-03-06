import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPrescriptionRequestsPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("prescription.allRequests"),
  robots: { index: false, follow: false },
};

export default function AdminPrescriptionRequestsPage() {
  return <AdminPrescriptionRequestsPageContent />;
}
