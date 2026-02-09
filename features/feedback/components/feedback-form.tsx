"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFeedbackSchema, type FeedbackFormData } from "../schemas";
import { useSubmitFeedback } from "../hooks";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function FeedbackForm() {
  const { t, locale } = useTranslation();
  const { mutate: submitFeedback, isPending } = useSubmitFeedback();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(createFeedbackSchema(locale)),
    defaultValues: {
      type: undefined,
      name: "",
      email: "",
      phone: "",
      content: "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedback(
      {
        type: data.type,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        content: data.content,
      },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Type Selection */}
      <div className="space-y-3">
        <Label required>{t("feedback.selectType")}</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() =>
              setValue("type", "COMPLAINT", { shouldValidate: true })
            }
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              selectedType === "COMPLAINT"
                ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                : "border-border hover:border-red-300 dark:hover:border-red-700",
            )}
          >
            <AlertCircle
              className={cn(
                "h-8 w-8",
                selectedType === "COMPLAINT"
                  ? "text-red-500"
                  : "text-muted-foreground",
              )}
            />
            <span className="text-sm font-medium">
              {t("feedback.complaint")}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setValue("type", "SUGGESTION", { shouldValidate: true })
            }
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
              selectedType === "SUGGESTION"
                ? "border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                : "border-border hover:border-green-300 dark:hover:border-green-700",
            )}
          >
            <Lightbulb
              className={cn(
                "h-8 w-8",
                selectedType === "SUGGESTION"
                  ? "text-green-500"
                  : "text-muted-foreground",
              )}
            />
            <span className="text-sm font-medium">
              {t("feedback.suggestion")}
            </span>
          </button>
        </div>
        {errors.type && (
          <p className="text-sm text-error-500">{errors.type.message}</p>
        )}
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          {t("feedback.name")}
        </Label>
        <Input
          id="name"
          placeholder={t("feedback.namePlaceholder")}
          icon={<User className="h-5 w-5" />}
          iconPosition="start"
          error={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-error-500">{errors.name.message}</p>
        )}
      </div>

      {/* Contact Info Section */}
      <div className="space-y-4">
        <div>
          <Label>{t("feedback.contactInfo")}</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {t("feedback.contactInfoHint")}
          </p>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("feedback.email")}</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            placeholder={t("feedback.emailPlaceholder")}
            icon={<Mail className="h-5 w-5" />}
            iconPosition="start"
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-error-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t("feedback.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder={t("feedback.phonePlaceholder")}
            icon={<Phone className="h-5 w-5" />}
            iconPosition="start"
            error={!!errors.phone}
            dir="ltr"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-error-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Content Field */}
      <div className="space-y-2">
        <Label htmlFor="content" required>
          {t("feedback.content")}
        </Label>
        <Textarea
          id="content"
          placeholder={t("feedback.contentPlaceholder")}
          className={cn(
            "min-h-[150px]",
            errors.content && "border-error-500 focus-visible:ring-error-500",
          )}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-sm text-error-500">{errors.content.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" loading={isPending}>
        {isPending ? t("feedback.submitting") : t("feedback.submit")}
      </Button>
    </form>
  );
}
