"use client";

import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-xl sm:text-2xl font-bold text-foreground">
          {t("pages.forgotPassword.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("pages.forgotPassword.subtitle")}
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" required>
            {t("auth.email")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t("placeholder.email")}
            icon={<Mail className="h-5 w-5" />}
            iconPosition="start"
          />
        </div>

        <Button type="submit" className="w-full" size="lg">
          {t("pages.forgotPassword.sendResetLink")}
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          {t("pages.forgotPassword.backToLogin")}
        </Link>
      </form>
    </>
  );
}
