import { z } from "zod";

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function todayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidDateInput(value: string) {
  if (!DATE_INPUT_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export const orderWithoutContractSchema = z.object({
  buyerName: z.string().min(1, "Buyer/Government name is required"),
  farmerName: z.string().min(1, "Farmer name is required"),
  cropName: z.string().min(1, "Crop name is required"),
  cropType: z.string().min(1, "Crop type selection is required"),

  quantity: z
    .preprocess(
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
        .min(0.01, "Quantity must be greater than 0")
    ),

  unitType: z.enum(["KG", "TONS", "BAG"]),

  pricePerUnit: z
    .preprocess(
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
        .min(0.01, "Price per unit must be greater than 0")
    ),

  currencyCode: z.enum(["USD", "KHR"]),

  totalPrice: z
    .preprocess(
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
        .min(0)
    ),

  deliveryDate: z
    .string()
    .min(1, "Delivery date is required")
    .refine(isValidDateInput, "Select a valid delivery date")
    .refine((value) => value >= todayInputValue(), "Delivery date cannot be before today"),
});

export type OrderFormInput = z.input<typeof orderWithoutContractSchema>;
export type OrderFormValues = z.output<typeof orderWithoutContractSchema>;
