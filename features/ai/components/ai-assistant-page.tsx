"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Loader2,
  Bot,
  MessageSquare,
  LogIn,
  ShieldOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/lib/i18n";
import { useIsAuthenticated, useIsHydrated } from "@/lib/auth/store";
import { AiDisclaimerBanner } from "./ai-disclaimer-banner";
import { AiChatMessage } from "./ai-chat-message";
import { useAiStatus } from "../hooks/use-ai-status";
import {
  useSendAiMessage,
  useAiConversations,
  type AiChatResponse,
} from "../hooks/use-ai-chat";

export function AiAssistantPage() {
  const { t, locale } = useTranslation();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <AiChatFullPage />;
}

function LoginPrompt() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <LogIn className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-3">{t("ai.loginRequired")}</h1>
        <p className="text-muted-foreground mb-6">
          {t("ai.loginRequiredDescription")}
        </p>
        <Button asChild size="lg">
          <Link href="/login">{t("auth.login")}</Link>
        </Button>
      </div>
    </div>
  );
}

function AiChatFullPage() {
  const { t, locale } = useTranslation();
  const { data: status, isLoading: statusLoading } = useAiStatus();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = useSendAiMessage();
  const { data: historyData } = useAiConversations(1, 50);

  const [sessionMessages, setSessionMessages] = useState<AiChatResponse[]>([]);
  const [remainingQuestions, setRemainingQuestions] = useState(0);

  useEffect(() => {
    if (status) {
      setRemainingQuestions(status.remainingQuestions);
    }
  }, [status]);

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

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!status?.isEnabled) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShieldOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-3">{t("ai.chatTitle")}</h1>
          <p className="text-muted-foreground">{t("ai.featureDisabled")}</p>
        </div>
      </div>
    );
  }

  const historyMessages = historyData?.data
    ? [...historyData.data].reverse()
    : [];
  const sessionIds = new Set(sessionMessages.map((m) => m.id));
  const filteredHistory = historyMessages.filter((m) => !sessionIds.has(m.id));
  const hasMessages = filteredHistory.length > 0 || sessionMessages.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("ai.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("ai.subtitle")}</p>
          </div>
          <Badge variant="outline" className="ms-auto text-xs">
            {t("ai.remainingQuestions")
              .replace("{remaining}", remainingQuestions.toString())
              .replace("{total}", status.dailyLimit.toString())}
          </Badge>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-0">
          {/* Disclaimer */}
          <div className="px-4 pt-4">
            <AiDisclaimerBanner />
          </div>

          {/* Messages */}
          <div className="px-4 py-4 space-y-4 min-h-[400px] max-h-[60vh] overflow-y-auto">
            {!hasMessages && !sendMessage.isPending && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-sm text-center">{t("ai.noHistory")}</p>
              </div>
            )}

            {filteredHistory.map((conv) => (
              <AiChatMessage
                key={conv.id}
                question={conv.question}
                answer={conv.answer}
              />
            ))}

            {sessionMessages.map((msg) => (
              <AiChatMessage
                key={msg.id}
                question={msg.question}
                answer={msg.answer}
              />
            ))}

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

          {/* Input */}
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
        </CardContent>
      </Card>
    </div>
  );
}
