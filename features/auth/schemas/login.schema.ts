import { z } from 'zod';
import { getTranslation, type Locale } from '@/lib/i18n';

export const createLoginSchema = (locale: Locale = 'ar') => {
  const t = (key: string) => getTranslation(key, locale);

  return z.object({
    email: z
      .string()
      .min(1, t('validation.emailRequired'))
      .email(t('validation.emailInvalid')),
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(8, t('validation.passwordMinLength')),
  });
};

export const loginSchema = createLoginSchema();

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
