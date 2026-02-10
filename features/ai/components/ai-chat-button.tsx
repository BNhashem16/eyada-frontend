"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAiStatus } from "../hooks/use-ai-status";
import { AiChatDialog } from "./ai-chat-dialog";
import { useTranslation } from "@/lib/i18n";

export function AiChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: status, isLoading } = useAiStatus();
  const { isRtl } = useTranslation();

  // Don't render anything if feature is disabled or loading
  if (isLoading || !status?.isEnabled) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        style={isRtl ? { left: "1.5rem" } : { right: "1.5rem" }}
        size="icon"
      >
        <Bot className="h-6 w-6" />
        {status.remainingQuestions > 0 && (
          <span className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-green-500 text-[10px] text-white flex items-center justify-center font-medium">
            {status.remainingQuestions}
          </span>
        )}
      </Button>

      {isOpen && (
        <AiChatDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          status={status}
        />
      )}
    </>
  );
}
