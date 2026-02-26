import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { PharmacyOrderDetailContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.orderDetails"),
  description: getTranslation("pharmacyOwner.orderDetails"),
  robots: { index: false, follow: false },
};

export default async function PharmacyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PharmacyOrderDetailContent orderId={id} />;
}
