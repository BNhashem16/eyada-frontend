import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PrescriptionsPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("prescription.myRequests"),
  robots: { index: false, follow: false },
};

export default function PrescriptionsPage() {
  return <PrescriptionsPageContent />;
}
