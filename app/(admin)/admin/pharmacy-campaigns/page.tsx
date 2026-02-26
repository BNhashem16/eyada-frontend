import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyCampaignsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("nav.campaigns"),
  robots: { index: false, follow: false },
};

export default function PharmacyCampaignsPage() {
  return <PharmacyCampaignsContent />;
}
