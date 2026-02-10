import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { FeedbackPageContent } from "@/features/feedback/components/feedback-page-content";

export const metadata: Metadata = {
  title: getTranslation("meta.feedback.title"),
  description: getTranslation("meta.feedback.description"),
  openGraph: {
    title: getTranslation("meta.feedback.title"),
    description: getTranslation("meta.feedback.description"),
    url: "https://clinics-eg.com/feedback",
  },
  alternates: {
    canonical: "https://clinics-eg.com/feedback",
  },
};

export default function FeedbackPage() {
  return <FeedbackPageContent />;
}
