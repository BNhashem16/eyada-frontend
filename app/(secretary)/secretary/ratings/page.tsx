import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { SecretaryRatingsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.secretaryRatings.title"),
  description: getTranslation("meta.secretaryRatings.description"),
  robots: { index: false, follow: false },
};

export default function SecretaryRatingsPage() {
  return <SecretaryRatingsContent />;
}
