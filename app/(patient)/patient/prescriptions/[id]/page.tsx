import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PrescriptionDetailPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("prescription.requestDetails"),
  robots: { index: false, follow: false },
};

export default function PrescriptionDetailPage() {
  return <PrescriptionDetailPageContent />;
}
