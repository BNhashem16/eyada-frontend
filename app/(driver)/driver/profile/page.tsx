import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { DriverProfileContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.driverProfile.title"),
  description: getTranslation("meta.driverProfile.description"),
  robots: { index: false, follow: false },
};

export default function DriverProfilePage() {
  return <DriverProfileContent />;
}
