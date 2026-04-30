import { z } from "zod";
import type { LocaleAwareT } from "./_shared";

/**
 * Wallet → "Request settlement" form.
 *
 * The user enters an amount they want to withdraw. Validation:
 *   - amount: positive number, ≤ available balance (enforced separately
 *     by the form via `.refine` if needed; the backend is the source of
 *     truth for available balance).
 *   - notes: optional, ≤ 500.
 */
export const createSettlementRequestSchema = (t: LocaleAwareT) =>
  z.object({
    amount: z.coerce
      .number()
      .min(0.01, t("validation.required"))
      .max(1_000_000),
    notes: z.string().max(500).optional().or(z.literal("")),
  });

export type SettlementRequestFormData = z.infer<
  ReturnType<typeof createSettlementRequestSchema>
>;
