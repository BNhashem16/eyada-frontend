import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminPaymentMethodsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminPaymentMethods.title"),
  description: getTranslation("meta.adminPaymentMethods.description"),
  robots: { index: false, follow: false },
};

export default function AdminPaymentMethodsPage() {
  return <AdminPaymentMethodsContent />;
}
