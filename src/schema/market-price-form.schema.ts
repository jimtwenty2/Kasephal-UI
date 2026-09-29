import { z } from "zod";

export const MIN_PRICE_KHR = 100;
export const MAX_PRICE_KHR = 500_000_000;

const NUMERIC_STRING_REGEX = /^\d+$/;

const priceField = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .refine((val) => NUMERIC_STRING_REGEX.test(val), {
    message: "Numbers only — no letters, decimals, or symbols.",
  })
  .transform((val) => Number(val))
  .pipe(
    z
      .number()
      .min(MIN_PRICE_KHR, `Must be at least ${MIN_PRICE_KHR.toLocaleString()} KHR.`)
      .max(MAX_PRICE_KHR, `Must be at most ${MAX_PRICE_KHR.toLocaleString()} KHR.`),
  );
  
export const marketPriceFormSchema = z
  .object({
    cropTypeId: z.string().min(1, "Please select a crop type."),
    cropId: z.string().min(1, "Please select a crop name."),
    region: z.string().min(1, "Please select a region."),
    unitType: z.enum(["KG", "TON"]),
    validityDate: z.string().min(1, "Please select a validity date."),
    currentPricePerUnit: priceField,
    minFloorPrice: priceField,
    priceThresholds: priceField,
  })
  .superRefine((data, ctx) => {
    if (data.minFloorPrice > data.currentPricePerUnit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minFloorPrice"],
        message: "Floor price cannot be higher than the current price.",
      });
    }
  });

export type MarketPriceFormValues = z.input<typeof marketPriceFormSchema>;
export type MarketPriceFormOutput = z.output<typeof marketPriceFormSchema>;