import { z } from "zod";
import { getTranslation, type Locale } from "@/lib/i18n";

export const createAddressSchema = (locale: Locale = "ar") => {
  const t = (key: string) => getTranslation(key, locale);

  return z.object({
    label: z.string().min(1, t("validation.addressLabelRequired")).max(50),
    address: z.string().min(1, t("validation.addressTextRequired")).max(500),
    phoneNumber: z
      .string()
      .min(1, t("validation.addressPhoneRequired"))
      .regex(/^01[0125][0-9]{8}$/, t("validation.phoneInvalid")),
    city: z.string().max(100).optional().or(z.literal("")),
    area: z.string().max(100).optional().or(z.literal("")),
    buildingNumber: z.string().max(20).optional().or(z.literal("")),
    floor: z.string().max(10).optional().or(z.literal("")),
    apartment: z.string().max(20).optional().or(z.literal("")),
    landmark: z.string().max(200).optional().or(z.literal("")),
    notes: z.string().max(300).optional().or(z.literal("")),
    isDefault: z.boolean().optional(),
  });
};

export type AddressFormData = z.infer<ReturnType<typeof createAddressSchema>>;
