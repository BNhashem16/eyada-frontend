import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminContactLinksContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminContactLinks.title"),
  description: getTranslation("meta.adminContactLinks.description"),
  robots: { index: false, follow: false },
};

export default function AdminContactLinksPage() {
  return <AdminContactLinksContent />;
}
