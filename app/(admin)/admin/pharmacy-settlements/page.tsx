import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacySettlementsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminSettlements.title"),
  description: getTranslation("meta.adminSettlements.description"),
  robots: { index: false, follow: false },
};

export default function PharmacySettlementsPage() {
  return <PharmacySettlementsContent />;
}
