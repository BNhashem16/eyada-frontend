import { z } from "zod";
import { getTranslation, type Locale } from "@/lib/i18n";

// Egyptian phone number regex
const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;

export const createRegisterSchema = (locale: Locale = "ar") => {
  const t = (key: string) => getTranslation(key, locale);

  return z.object({
    fullName: z
      .string()
      .min(1, t("validation.fullNameRequired"))
      .min(2, t("validation.fullNameMinLength"))
      .max(100, t("validation.fullNameMaxLength")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    phoneNumber: z
      .string()
      .min(1, t("validation.phoneRequired"))
      .regex(egyptianPhoneRegex, t("validation.phoneInvalid")),
    password: z
      .string()
      .min(1, t("validation.passwordRequired"))
      .min(8, t("validation.passwordMinLength"))
      .max(50, t("validation.passwordMaxLength")),
    confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
    role: z.enum(["PATIENT", "DOCTOR"]),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: t("validation.termsRequired"),
    }),
  });
};

export const createRegisterSchemaWithConfirm = (locale: Locale = "ar") => {
  const t = (key: string) => getTranslation(key, locale);

  return createRegisterSchema(locale).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: t("validation.passwordMismatch"),
      path: ["confirmPassword"],
    },
  );
};

export const registerSchema = createRegisterSchema();
export const registerSchemaWithConfirm = createRegisterSchemaWithConfirm();

export type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;
