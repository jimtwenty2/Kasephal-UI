// personal-info.schema.ts
import { z } from "zod";

export const onlyStringRegex = /^[A-Za-z\s]+$/;

export const sanitizeLettersAndSpaces = (value: string) =>
  value.replace(/[^A-Za-z\s]/g, "");

const optionalTextOnly = (field: string, max = 255) =>
  z
    .string()
    .max(max, `${field} cannot exceed ${max} characters`)
    .refine((value) => !value || onlyStringRegex.test(value), {
      message: `${field} must contain letters and spaces only`,
    })
    .optional()
    .or(z.literal(""));

export const personalInfoSchema = z.object({
  fullName: optionalTextOnly("Full name", 100),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !Number.isNaN(date.getTime()) && date < new Date();
      },
      { message: "Date of birth must be in the past" },
    ),
  placeOfBirthProvinceId: z.string().optional().or(z.literal("")),
  bio: z.string().max(255, "Bio cannot exceed 255 characters").optional().or(z.literal("")),

  farmName: optionalTextOnly("Farm name"),
  farmSize: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) > 0),
      { message: "Farm size must be a valid positive number" },
    ),
  farmProvinceId: z.string().optional().or(z.literal("")),
  farmDistrictId: z.string().optional().or(z.literal("")),
  farmCommuneId: z.string().optional().or(z.literal("")),
  farmVillageId: z.string().optional().or(z.literal("")),

  companyName: optionalTextOnly("Company name"),
  businessType: optionalTextOnly("Business type"),
  businessProvinceId: z.string().optional().or(z.literal("")),
  businessDistrictId: z.string().optional().or(z.literal("")),
  businessCommuneId: z.string().optional().or(z.literal("")),
  businessVillageId: z.string().optional().or(z.literal("")),

  ministryName: optionalTextOnly("Ministry name"),
  addressProvinceId: z.string().optional().or(z.literal("")),
  addressDistrictId: z.string().optional().or(z.literal("")),
  addressCommuneId: z.string().optional().or(z.literal("")),
  addressVillageId: z.string().optional().or(z.literal("")),
});

export type FormData = z.infer<typeof personalInfoSchema>;

export function readString(source: unknown, keys: string[]): string {
  const object = (source ?? {}) as unknown as Record<string, unknown>;
  for (const key of keys) {
    const value = object[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return "";
}