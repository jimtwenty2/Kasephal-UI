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

export const orderWithContractSchema = z.object({
  buyerName: z.string().min(1, "Buyer/Government name is required"),
  farmerName: z.string().min(1, "Farmer name is required"),
  cropName: z.string().min(1, "Crop name is required"),
  cropType: z.string().min(1, "Crop type selection is required"),
  quantity: z.preprocess(
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
      .min(0.01, "Must be greater than 0")
  ),
  unitType: z.enum(["KG", "TONS"]), 
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
      .min(0.01, "Must be greater than 0")
  ),
  currencyCode: z.enum(["USD", "KHR"]),
  totalPrice: z.number().min(0),
  deliveryDate: z
    .string()
    .min(1, "Delivery date is required")
    .refine(isValidDateInput, "Select a valid delivery date")
    .refine((value) => value >= todayInputValue(), "Delivery date cannot be before today"),
  depositPercentage: z.preprocess(
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
      .min(1)
      .max(100)
  ),
  remainingBalance: z.number().min(0),
  totalPayment: z.number().min(0), // Deposit Amount to pay now
  deposit: z
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
        .min(0, "Deposit must be greater than or equal 0")
    ),
}).superRefine((data, ctx) => {
  if (data.currencyCode !== "KHR") return;

  if (!Number.isInteger(data.pricePerUnit)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pricePerUnit"],
      message: "Price per unit in KHR cannot include decimal values",
    });
  } else if (data.pricePerUnit < 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pricePerUnit"],
      message: "Price per unit in KHR must be at least 100",
    });
  } else if (data.pricePerUnit % 100 !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pricePerUnit"],
      message: "Price per unit in KHR must be divisible by 100",
    });
  }

  if (!Number.isInteger(data.totalPayment)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["totalPayment"],
      message: "Deposit amount in KHR cannot include decimal values",
    });
  } else if (data.totalPayment < 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["totalPayment"],
      message: "Deposit amount in KHR must be at least 100",
    });
  }
});

export type OrderWithContractInput = z.input<typeof orderWithContractSchema>;
export type OrderWithContractValues = z.output<typeof orderWithContractSchema>;
