"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n";
import { AiDisclaimerBanner } from "./ai-disclaimer-banner";
import { AiChatMessage } from "./ai-chat-message";
import {
  useSendAiMessage,
  useAiConversations,
  type AiChatResponse,
} from "../hooks/use-ai-chat";
import type { AiStatus } from "../hooks/use-ai-status";

interface AiChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: AiStatus;
}

export function AiChatDialog({
  open,
  onOpenChange,
  status,
}: AiChatDialogProps) {
  const { t, locale } = useTranslation();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendAiMessage();
  const { data: historyData } = useAiConversations(1, 50);

  // Local session messages (newly sent in this session)
  const [sessionMessages, setSessionMessages] = useState<AiChatResponse[]>([]);
  const [remainingQuestions, setRemainingQuestions] = useState(
    status.remainingQuestions,
  );

  useEffect(() => {
    setRemainingQuestions(status.remainingQuestions);
  }, [status.remainingQuestions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionMessages, historyData]);

  const handleSend = () => {
    if (!message.trim() || message.trim().length < 10) return;
    if (remainingQuestions <= 0) return;

    const currentMessage = message;
    setMessage("");

    sendMessage.mutate(
      { message: currentMessage, language: locale as "ar" | "en" },
      {
        onSuccess: (data) => {
          setSessionMessages((prev) => [...prev, data]);
          setRemainingQuestions(data.remainingQuestions);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Combine history (older first) + session messages
  const historyMessages = historyData?.data
    ? [...historyData.data].reverse()
    : [];

  // Filter out history messages that are also in session (by id)
  const sessionIds = new Set(sessionMessages.map((m) => m.id));
  const filteredHistory = historyMessages.filter((m) => !sessionIds.has(m.id));

  const hasMessages = filteredHistory.length > 0 || sessionMessages.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-base">
                {t("ai.chatTitle")}
              </DialogTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {t("ai.remainingQuestions")
                .replace("{remaining}", remainingQuestions.toString())
                .replace("{total}", status.dailyLimit.toString())}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Disclaimer */}
        <div className="px-4 pt-3">
          <AiDisclaimerBanner />
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-[200px] max-h-[400px]">
          {!hasMessages && !sendMessage.isPending && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm text-center">{t("ai.noHistory")}</p>
            </div>
          )}

          {/* History messages */}
          {filteredHistory.map((conv) => (
            <AiChatMessage
              key={conv.id}
              question={conv.question}
              answer={conv.answer}
            />
          ))}

          {/* Session messages */}
          {sessionMessages.map((msg) => (
            <AiChatMessage
              key={msg.id}
              question={msg.question}
              answer={msg.answer}
            />
          ))}

          {/* Loading state */}
          {sendMessage.isPending && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
              </div>
              <span className="text-sm">{t("ai.sending")}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <Separator />

        {/* Input area */}
        <div className="p-4">
          {remainingQuestions <= 0 ? (
            <p className="text-sm text-center text-muted-foreground py-2">
              {t("ai.noQuestionsRemaining")}
            </p>
          ) : (
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("ai.chatPlaceholder")}
                rows={2}
                className="resize-none flex-1"
                disabled={sendMessage.isPending}
                maxLength={2000}
              />
              <Button
                onClick={handleSend}
                disabled={
                  sendMessage.isPending ||
                  !message.trim() ||
                  message.trim().length < 10
                }
                size="icon"
                className="h-auto self-end"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
