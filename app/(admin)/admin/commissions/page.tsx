import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminCommissionsContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminCommissions.title"),
  description: getTranslation("meta.adminCommissions.description"),
  robots: { index: false, follow: false },
};

export default function AdminCommissionsPage() {
  return <AdminCommissionsContent />;
}
