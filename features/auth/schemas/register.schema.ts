import { z } from 'zod';

// Egyptian phone number regex
const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;

// Password requirements regex (at least one uppercase, one lowercase, one number or special char)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'الاسم الكامل مطلوب')
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم لا يجب أن يتجاوز 100 حرف'),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('البريد الإلكتروني غير صالح'),
  phoneNumber: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .regex(egyptianPhoneRegex, 'رقم الهاتف غير صالح (مثال: 01012345678)'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .max(50, 'كلمة المرور لا يجب أن تتجاوز 50 حرف')
    .regex(
      passwordRegex,
      'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم أو رمز'
    ),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  role: z.enum(['PATIENT', 'DOCTOR']).default('PATIENT'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام',
  }),
});

export const registerSchemaWithConfirm = registerSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  }
);

export type RegisterFormData = z.infer<typeof registerSchema>;
