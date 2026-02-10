"use client";

import { Bot, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface AiChatMessageProps {
  question: string;
  answer: string;
}

export function AiChatMessage({ question, answer }: AiChatMessageProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* User question */}
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t("ai.you")}
          </p>
          <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap break-words">
              {question}
            </p>
          </div>
        </div>
      </div>

      {/* AI answer */}
      <div className="flex items-start gap-2">
        <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {t("ai.assistant")}
          </p>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap break-words">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
