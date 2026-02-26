import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { CheckoutPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.checkout"),
  description: getTranslation("pharmacyOwner.checkoutSubtitle"),
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
