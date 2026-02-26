import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyWalletContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.pharmacyWallet.title"),
  description: getTranslation("meta.pharmacyWallet.description"),
  robots: { index: false, follow: false },
};

export default function PharmacyWalletPage() {
  return <PharmacyWalletContent />;
}
