import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { NewSecretaryContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.doctorNewSecretary.title"),
  description: getTranslation("meta.doctorNewSecretary.description"),
  robots: { index: false, follow: false },
};

export default function NewSecretaryPage() {
  return <NewSecretaryContent />;
}
