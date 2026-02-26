import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { EditProductContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.editProductTitle"),
  description: getTranslation("pharmacyOwner.editProductSubtitle"),
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditProductContent productId={id} />;
}
