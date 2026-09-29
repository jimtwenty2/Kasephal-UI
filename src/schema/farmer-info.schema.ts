import { z } from "zod";
import {
  DATE_OF_BIRTH_AGE_MESSAGE,
  isDateOfBirthAgeValid,
} from "./date-of-birth.schema";
const farmNameRegex = /^[\p{L}\p{N}&'().,\-/ ]+$/u;

export const farmerInfoSchema = z.object({
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

  farmProvinceId: z.string().min(1, "Farm province is required"),
  farmDistrictId: z.string().min(1, "Farm district is required"),
  farmCommuneId: z.string().nullable(),
  farmVillageId: z.string().nullable(),

  farmName: z
    .string()
    .trim()
    .min(3, "Farm name is required")
    .max(100, "Farm name cannot exceed 100 characters")
    .refine((value) => farmNameRegex.test(value) && !/\s{2,}/.test(value), {
      message: "Farm name contains invalid characters or consecutive spaces",
    }),

  farmSize: z.coerce
    .number("Farm size must be the number")
    .min(1, "Farm size must be at least 1 ha")
    .max(1000, "Farm size must not exceed 1000 ha"),

  profileUrl: z.string().nullable(),
});

export type FarmerInfoSchemaInput = z.input<typeof farmerInfoSchema>;
export type FarmerInfoSchema = z.output<typeof farmerInfoSchema>;
