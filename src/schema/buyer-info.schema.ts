import { z } from "zod";
import {
  DATE_OF_BIRTH_AGE_MESSAGE,
  isDateOfBirthAgeValid,
} from "./date-of-birth.schema";

export const buyerInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Fullname is required")
    .regex(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Full name can contain letters and single spaces only",
    ),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(isDateOfBirthAgeValid, DATE_OF_BIRTH_AGE_MESSAGE),
  placeOfBirthProvinceId: z
    .string()
    .min(1, "Place of birth province is required"),
  businessProvinceId: z.string().min(1, "Farm province is required"),
  businessDistrictId: z.string().min(1, "Farm district is required"),
  businessCommuneId: z.string().nullable(),
  businessVillageId: z.string().nullable(),
  businessName: z
    .string()
    .trim()
    .min(3, "Business name is required")
    .max(100, "Business name cannot exceed 100 characters")
    .refine(
      (value) =>
        /^[A-Za-z0-9&'().,\-/ ]+$/.test(value) && !/\s{2,}/.test(value),
      {
        message:
          "Business name contains invalid characters or consecutive spaces",
      },
    ),
  businessType: z
    .string()
    .trim()
    .min(2, "Business type is required")
    .max(50, "Business type cannot exceed 50 characters")
    .refine(
      (value) => /^[A-Za-z&/\- ]+$/.test(value) && !/\s{2,}/.test(value),
      {
        message: "Business type can contain only letters, spaces, &, / and -",
      },
    ),
  profileUrl: z.string().nullable(),
});

export type BuyerInfoShcema = z.infer<typeof buyerInfoSchema>;
