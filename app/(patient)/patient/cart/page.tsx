import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { CartPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.cart"),
  description: getTranslation("pharmacyOwner.cartEmpty"),
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageContent />;
}
