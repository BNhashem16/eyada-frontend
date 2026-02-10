import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminSecretariesContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminSecretaries.title"),
  description: getTranslation("meta.adminSecretaries.description"),
  robots: { index: false, follow: false },
};

export default function AdminSecretariesPage() {
  return <AdminSecretariesContent />;
}
