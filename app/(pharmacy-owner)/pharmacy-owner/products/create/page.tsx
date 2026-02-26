import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { CreateProductContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.createProductTitle"),
  description: getTranslation("pharmacyOwner.createProductSubtitle"),
  robots: { index: false, follow: false },
};

export default function CreateProductPage() {
  return <CreateProductContent />;
}
