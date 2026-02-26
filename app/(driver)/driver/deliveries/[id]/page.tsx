import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DriverDeliveryDetailContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.driverDeliveryDetail.title"),
  description: getTranslation("meta.driverDeliveryDetail.description"),
  robots: { index: false, follow: false },
};

export default function DriverDeliveryDetailPage() {
  return <DriverDeliveryDetailContent />;
}
