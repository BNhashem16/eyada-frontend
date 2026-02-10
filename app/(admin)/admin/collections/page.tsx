import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminCollectionsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminCollections.title"),
  description: getTranslation("meta.adminCollections.description"),
  robots: { index: false, follow: false },
};

export default function AdminCollectionsPage() {
  return <AdminCollectionsContent />;
}
