import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminDashboardContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminDashboard.title"),
  description: getTranslation("meta.adminDashboard.description"),
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
