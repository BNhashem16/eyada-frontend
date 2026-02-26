import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AddressesPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("addresses.title"),
  description: getTranslation("addresses.subtitle"),
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return <AddressesPageContent />;
}
