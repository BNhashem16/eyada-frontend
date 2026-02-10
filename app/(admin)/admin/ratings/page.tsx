import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminRatingsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminRatings.title"),
  description: getTranslation("meta.adminRatings.description"),
  robots: { index: false, follow: false },
};

export default function AdminRatingsPage() {
  return <AdminRatingsContent />;
}
