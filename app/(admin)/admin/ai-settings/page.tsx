import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminAiSettingsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminAiSettings.title"),
  description: getTranslation("meta.adminAiSettings.description"),
  robots: { index: false, follow: false },
};

export default function AdminAiSettingsPage() {
  return <AdminAiSettingsContent />;
}
