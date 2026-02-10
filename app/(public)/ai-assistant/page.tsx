import { Metadata } from "next";
import { getTranslation } from "@/lib/i18n";
import { AiAssistantPage } from "@/features/ai/components/ai-assistant-page";

export const metadata: Metadata = {
  title: getTranslation("meta.aiAssistant.title"),
  description: getTranslation("meta.aiAssistant.description"),
};

export default function AiAssistantRoute() {
  return <AiAssistantPage />;
}
