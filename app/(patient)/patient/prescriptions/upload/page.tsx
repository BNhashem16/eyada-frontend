import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { UploadPrescriptionPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("prescription.uploadTitle"),
  robots: { index: false, follow: false },
};

export default function UploadPrescriptionPage() {
  return <UploadPrescriptionPageContent />;
}
