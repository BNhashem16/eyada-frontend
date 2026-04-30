import { z } from "zod";
import { DeliveryType } from "@/types/enums";
import {
  EGYPT_PHONE_REGEX,
  optionalCoercedNumber,
  type LocaleAwareT,
} from "./_shared";

/**
 * Locale-aware Zod factory for the pharmacy create/edit form.
 *
 * Keep behavior identical to the previous inline `getPharmacySchema`:
 *   - name + address required (min length 2)
 *   - description optional, max 2000
 *   - lat/lng optional, coerced to number, ranged
 *   - phone numbers as field-array of regex-or-empty strings
 *   - deliveryType is a native enum
 *   - all delivery numerics optional & coerced
 */
export const createPharmacySchema = (t: LocaleAwareT) =>
  z.object({
    name: z.string().min(2, t("validation.required")).max(200),
    description: z.string().max(2000).optional().or(z.literal("")),
    address: z.string().min(2, t("validation.required")).max(500),
    stateId: z.string().min(1, t("validation.required")),
    cityId: z.string().min(1, t("validation.required")),
    latitude: optionalCoercedNumber({ min: -90, max: 90 }),
    longitude: optionalCoercedNumber({ min: -180, max: 180 }),
    phoneNumbers: z
      .array(
        z.object({
          value: z
            .string()
            .regex(EGYPT_PHONE_REGEX, t("validation.phoneInvalid"))
            .or(z.literal("")),
        }),
      )
      .min(1),
    deliveryType: z.nativeEnum(DeliveryType),
    deliveryFee: optionalCoercedNumber({ min: 0 }),
    minOrderAmount: optionalCoercedNumber({ min: 0 }),
    freeDeliveryThreshold: optionalCoercedNumber({ min: 0 }),
    isActive: z.boolean(),
  });

export type PharmacyFormData = z.infer<ReturnType<typeof createPharmacySchema>>;
