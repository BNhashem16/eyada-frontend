import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { SecretarySchedulesContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.secretarySchedules.title"),
  description: getTranslation("meta.secretarySchedules.description"),
  robots: { index: false, follow: false },
};

export default function SecretarySchedulesPage() {
  return <SecretarySchedulesContent />;
}
