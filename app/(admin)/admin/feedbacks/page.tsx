import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AdminFeedbacksContent } from "./page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.adminFeedbacks.title"),
  description: getTranslation("meta.adminFeedbacks.description"),
  robots: { index: false, follow: false },
};

export default function AdminFeedbacksPage() {
  return <AdminFeedbacksContent />;
}
