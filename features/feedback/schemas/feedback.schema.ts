import { z } from "zod";
import { getTranslation, type Locale } from "@/lib/i18n";

export const createFeedbackSchema = (locale: Locale = "ar") => {
  const t = (key: string) => getTranslation(key, locale);

  return z
    .object({
      type: z.enum(["COMPLAINT", "SUGGESTION"], {
        required_error: t("validation.required"),
      }),
      name: z
        .string()
        .min(1, t("validation.fullNameRequired"))
        .min(2, t("validation.fullNameMinLength"))
        .max(100, t("validation.fullNameMaxLength")),
      email: z
        .string()
        .email(t("validation.emailInvalid"))
        .or(z.literal(""))
        .optional(),
      phone: z
        .string()
        .regex(/^01[0125][0-9]{8}$/, t("validation.phoneInvalid"))
        .or(z.literal(""))
        .optional(),
      content: z
        .string()
        .min(1, t("validation.required"))
        .min(10, t("feedback.contentMinLength") || t("validation.required"))
        .max(2000, t("feedback.contentMaxLength") || t("validation.required")),
    })
    .refine(
      (data) =>
        (data.email && data.email !== "") || (data.phone && data.phone !== ""),
      {
        message: t("feedback.emailOrPhoneRequired"),
        path: ["email"],
      },
    );
};

export type FeedbackFormData = z.infer<ReturnType<typeof createFeedbackSchema>>;
