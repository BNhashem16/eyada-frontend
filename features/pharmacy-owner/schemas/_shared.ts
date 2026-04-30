import { z } from "zod";

/**
 * Egyptian mobile pattern: 010, 011, 012, 015 followed by 8 digits.
 */
export const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/;

/**
 * Coerces a value to number, returning `undefined` for empty strings.
 *
 * Use for "the form input is a string but the API wants a number, and
 * empty means absent". Built on top of the same `z.coerce.number()` /
 * `z.literal("")` dance the inline schemas already use, so behavior is
 * identical to the pre-factory code.
 */
export const optionalCoercedNumber = (
  options: { min?: number; max?: number; int?: boolean } = {},
) => {
  let schema = z.coerce.number();
  if (options.min !== undefined) schema = schema.min(options.min);
  if (options.max !== undefined) schema = schema.max(options.max);
  if (options.int) schema = schema.int();
  return schema.optional().or(z.literal(""));
};

export type LocaleAwareT = (key: string) => string;
