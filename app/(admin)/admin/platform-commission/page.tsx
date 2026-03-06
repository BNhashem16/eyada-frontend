import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PlatformCommissionPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("prescription.commissionConfig"),
  robots: { index: false, follow: false },
};

export default function PlatformCommissionPage() {
  return <PlatformCommissionPageContent />;
}
