import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { SecretaryDashboardContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.secretaryDashboard.title"),
  description: getTranslation("meta.secretaryDashboard.description"),
  robots: { index: false, follow: false },
};

export default function SecretaryDashboardPage() {
  return <SecretaryDashboardContent />;
}
