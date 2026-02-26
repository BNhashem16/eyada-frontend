import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyCouponsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("nav.coupons"),
  robots: { index: false, follow: false },
};

export default function PharmacyCouponsPage() {
  return <PharmacyCouponsContent />;
}
