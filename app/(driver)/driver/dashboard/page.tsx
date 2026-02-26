import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DriverDashboardContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.driverDashboard.title"),
  description: getTranslation("meta.driverDashboard.description"),
  robots: { index: false, follow: false },
};

export default function DriverDashboardPage() {
  return <DriverDashboardContent />;
}
