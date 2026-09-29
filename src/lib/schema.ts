import { z } from "zod";

export const cropProductSchema = z
  .object({
    title: z
      .string()
      .min(5, "Please enter a product title with at least 5 characters.")
      .max(255, "Title must not exceed 255 characters.")
      .regex(
        /^[\p{L}\p{N}\s]+$/u,
        "Title must contain only letters, numbers, and spaces.",
      ),

    cropType: z.string().optional(),

    cropName: z.string().optional(),

    cropId: z
      .string()
      .min(1, "Please select a crop type first, then choose a crop name.")
      .regex(
        /^[0-9a-fA-F-]{36}$/,
        "Please select a crop type first, then choose a crop name.",
      ),

    totalQuantity: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          if (!/^\d*\.?\d*$/.test(val)) {
            return NaN;
          }
          return Number(val);
        }
        return val;
      },
      z
        .number()
        .refine((val) => !isNaN(val), "Please input number only")
        .positive("Please enter a quantity greater than 0."),
    ),

    unitType: z.enum(["KG", "TON"]),

    pricePerUnit: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          if (!/^\d*\.?\d*$/.test(val)) {
            return NaN;
          }
          return Number(val);
        }
        return val;
      },
      z
        .number()
        .refine((val) => !isNaN(val), "Please input number only")
        .positive("Please enter a price greater than 0."),
    ),

    currencyCode: z.enum(["KHR", "USD"]),

    description: z
      .string()
      .max(500, "Description must not exceed 500 characters.")
      .optional(),

    imageUrls: z
      .array(z.string())
      .min(1, "Please upload at least one product photo."),
  })
  .superRefine((data, ctx) => {
    if (
      data.currencyCode === "KHR" &&
      typeof data.pricePerUnit === "number" &&
      data.pricePerUnit % 100 !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pricePerUnit"],
        message: "Price in KHR must be divisible by 100",
      });
    }

    if (
      data.unitType === "TON" &&
      typeof data.totalQuantity === "number" &&
      !Number.isInteger(data.totalQuantity * 100)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["totalQuantity"],
        message: "Quantity must have at most 2 decimal places for TON",
      });
    }
  });

export type CropProductFormValues = z.infer<typeof cropProductSchema>;
export type CropProductFormInput = z.input<typeof cropProductSchema>;
