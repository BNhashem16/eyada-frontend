import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { OrdersPageContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("pharmacyOwner.myOrders"),
  description: getTranslation("pharmacyOwner.myOrders"),
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersPageContent />;
}
