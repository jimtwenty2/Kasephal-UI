import { z } from "zod";

export const cropDemandSchema = z
  .object({
    cropDemandPostId: z.string().optional(),

    title: z
      .string()
      .min(5, "Please enter a product title with at least 5 characters.")
      .max(255, "Title must not exceed 255 characters.")
      .regex(
        /^[\p{L}\p{N}\s]+$/u,
        "Title must contain only letters, numbers, and spaces.",
      ),

    cropName: z.string().optional(),

    cropType: z.string().optional(),

    cropId: z
      .string()
      .min(1, "Please select a valid crop")
      .regex(/^[0-9a-fA-F-]{36}$/, "Please select a valid crop"),

    buyerName: z.string().optional(),

    buyerProfileUrl: z.string().optional().default(""),

    quantityNeeded: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          // Check if the string is a valid number
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
        .positive("Quantity must be greater than 0"),
    ),

    unitType: z.enum(["KG", "TON"]),

    maxPricePerUnit: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          // Check if the string is a valid number
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
        .positive("Price must be greater than 0"),
    ),

    currencyCode: z.enum(["KHR", "USD"]),

    locationPreferences: z
      .string()
      .trim()
      .min(3, "Location preference is required")
      .regex(/^[A-Z_]+$/, "Please select a valid location"),

    expectedDeliveryDate: z
      .string()
      .min(1, "Expected delivery date is required"),

    demandLevel: z.enum(["LOW", "MODERATE", "HIGH"]),

    status: z.enum(["OPEN", "CLOSED", "MATCHED", "APPLY"]).optional(),

    createdAt: z.string().optional(),

    isOffered: z.boolean().default(false),

    imageUrls: z
      .array(z.string())
      .min(1, "Please upload at least one demand photo"),

    description: z
      .string()
      .max(500, "Description must not exceed 500 characters.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.currencyCode === "KHR" &&
      typeof data.maxPricePerUnit === "number" &&
      data.maxPricePerUnit % 100 !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxPricePerUnit"],
        message: "Price in KHR must be divisible by 100",
      });
    }

    if (
      data.unitType === "TON" &&
      typeof data.quantityNeeded === "number" &&
      !Number.isInteger(data.quantityNeeded * 100)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantityNeeded"],
        message: "Quantity must have at most 2 decimal places for TON",
      });
    }
  });

export type CropDemandFormInput = z.input<typeof cropDemandSchema>;
export type CropDemandFormValues = z.output<typeof cropDemandSchema>;
