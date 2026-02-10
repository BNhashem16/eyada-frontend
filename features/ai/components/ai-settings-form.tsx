"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  ShieldX,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/lib/i18n";
import {
  useAiSettings,
  useUpdateAiSettings,
  type UpdateAiSettingsData,
} from "../hooks/use-ai-settings";

export function AiSettingsForm() {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useAiSettings();
  const updateSettings = useUpdateAiSettings();

  const [isEnabled, setIsEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(5);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (settings) {
      setIsEnabled(settings.isEnabled);
      setDailyLimit(settings.dailyLimit);
      setSystemPrompt(settings.systemPrompt || "");
    }
  }, [settings]);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    updateSettings.mutate({ isEnabled: checked });
  };

  const handleSave = () => {
    const data: UpdateAiSettingsData = {
      dailyLimit,
      systemPrompt: systemPrompt || undefined,
    };

    if (apiKey) {
      data.apiKey = apiKey;
    }

    updateSettings.mutate(data, {
      onSuccess: () => {
        setApiKey("");
        setShowApiKeyInput(false);
      },
    });
  };

  const handleRemoveApiKey = () => {
    updateSettings.mutate({ apiKey: "" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const getStatusBadge = () => {
    if (settings?.isEnabled && settings?.hasApiKey) {
      return (
        <Badge variant="success">
          <ShieldCheck className="h-3 w-3 me-1" />
          {t("ai.statusConfigured")}
        </Badge>
      );
    }
    if (!settings?.hasApiKey) {
      return (
        <Badge variant="error">
          <ShieldX className="h-3 w-3 me-1" />
          {t("ai.statusNotConfigured")}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Shield className="h-3 w-3 me-1" />
        {t("ai.statusDisabled")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status & Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("ai.enableFeature")}</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground max-w-md">
              {t("ai.enableFeatureDescription")}
            </p>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t("ai.apiKey")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("ai.apiKeyDescription")}
          </p>

          {settings?.hasApiKey && !showApiKeyInput && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  {t("ai.apiKeyConfigured")}
                </span>
                {settings.apiKeyPreview && (
                  <code className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded ms-auto">
                    {settings.apiKeyPreview}
                  </code>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyInput(true)}
                >
                  {t("ai.changeApiKey")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveApiKey}
                  disabled={updateSettings.isPending}
                >
                  {t("ai.removeApiKey")}
                </Button>
              </div>
            </div>
          )}

          {(!settings?.hasApiKey || showApiKeyInput) && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t("ai.apiKey")}</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t("ai.apiKeyPlaceholder")}
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {showApiKeyInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKey("");
                  }}
                >
                  {t("common.cancel")}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Limit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("ai.dailyLimit")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("ai.dailyLimitDescription")}
          </p>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={100}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              {t("ai.questionsPerDay")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("ai.systemPrompt")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("ai.systemPromptDescription")}
          </p>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder={t("ai.systemPromptPlaceholder")}
            rows={4}
            maxLength={5000}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          size="lg"
        >
          {updateSettings.isPending && (
            <Loader2 className="h-4 w-4 me-2 animate-spin" />
          )}
          {t("ai.saveSettings")}
        </Button>
      </div>
    </div>
  );
}
