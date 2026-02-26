import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DriverDeliveriesContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.driverDeliveries.title"),
  description: getTranslation("meta.driverDeliveries.description"),
  robots: { index: false, follow: false },
};

export default function DriverDeliveriesPage() {
  return <DriverDeliveriesContent />;
}
