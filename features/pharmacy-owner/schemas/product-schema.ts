import { z } from "zod";
import { optionalCoercedNumber, type LocaleAwareT } from "./_shared";

/**
 * Locale-aware Zod factory for both create and edit product forms.
 *
 * The two forms had identical inline schemas; this is the single source.
 *   - bilingual name (ar + en) required (min length 2)
 *   - bilingual description optional, max 2000
 *   - sku, barcode optional
 *   - price required (> 0), max 100k
 *   - discountPrice optional, max 100k
 *   - stockQuantity / lowStockThreshold optional integers
 *   - boolean flags: requiresPrescription, isActive
 */
export const createProductSchema = (t: LocaleAwareT) =>
  z.object({
    nameAr: z.string().min(2, t("validation.required")).max(200),
    nameEn: z.string().min(2, t("validation.required")).max(200),
    descriptionAr: z.string().max(2000).optional().or(z.literal("")),
    descriptionEn: z.string().max(2000).optional().or(z.literal("")),
    categoryId: z.string().optional().or(z.literal("")),
    sku: z.string().max(50).optional().or(z.literal("")),
    barcode: z.string().max(50).optional().or(z.literal("")),
    price: z.coerce.number().min(0.01, t("validation.required")).max(100000),
    discountPrice: optionalCoercedNumber({ min: 0, max: 100000 }),
    stockQuantity: optionalCoercedNumber({ min: 0, int: true }),
    lowStockThreshold: optionalCoercedNumber({ min: 0, int: true }),
    requiresPrescription: z.boolean(),
    isActive: z.boolean(),
  });

export type ProductFormData = z.infer<ReturnType<typeof createProductSchema>>;
