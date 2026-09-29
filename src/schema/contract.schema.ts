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

// Validation for the buyer's "Create / Edit Digital Contract" form.
// Number fields come from text inputs, so they are coerced from strings.
// Price/deposit rules depend on the selected currency, so they live in the
// superRefine below rather than as static checks.
export const contractSchema = z
  .object({
    unitType: z.enum(["KG", "TON"]),

    currency: z.enum(["KHR", "USD"]),

    totalQuantity: z.coerce
      .number({ message: "Enter a quantity greater than zero." })
      .positive("Enter a quantity greater than zero."),

    pricePerUnit: z.coerce.number({ message: "Enter a valid price." }),

    depositAmount: z.coerce.number({ message: "Enter a valid deposit amount." }),

    deliveryDate: z.string().min(1, "Select the delivery date."),

    startDate: z.string().min(1, "Select the start date."),

    endDate: z.string().min(1, "Select the end date."),

    durationDays: z.coerce
      .number({ message: "Enter contract duration in days." })
      .int("Duration must be a whole number of days.")
      .positive("Duration must be greater than 0."),

    agreed: z
      .boolean()
      .refine((value) => value === true, "Please agree to the terms and conditions."),
  })
  .superRefine((data, ctx) => {
    const addIssue = (
      path:
        | "pricePerUnit"
        | "depositAmount"
        | "deliveryDate"
        | "startDate"
        | "endDate"
        | "durationDays",
      message: string,
    ) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    // ----- Dates (validated yyyy-mm-dd strings compare lexicographically) -----
    const today = todayInputValue();
    const startDateValid = !data.startDate || isValidDateInput(data.startDate);
    const deliveryDateValid = !data.deliveryDate || isValidDateInput(data.deliveryDate);
    const endDateValid = !data.endDate || isValidDateInput(data.endDate);

    if (data.startDate && !startDateValid) {
      addIssue("startDate", "Select a valid start date.");
    }

    if (data.deliveryDate && !deliveryDateValid) {
      addIssue("deliveryDate", "Select a valid delivery date.");
    }

    if (data.endDate && !endDateValid) {
      addIssue("endDate", "Select a valid end date.");
    }

    if (startDateValid && data.startDate && data.startDate < today) {
      addIssue("startDate", "Start date cannot be before today.");
    }

    if (deliveryDateValid && data.deliveryDate && data.deliveryDate < today) {
      addIssue("deliveryDate", "Delivery date cannot be before today.");
    }

    if (
      startDateValid &&
      deliveryDateValid &&
      data.startDate &&
      data.deliveryDate &&
      data.deliveryDate < data.startDate
    ) {
      addIssue("deliveryDate", "Delivery date must be on or after the start date.");
    }

    if (
      deliveryDateValid &&
      endDateValid &&
      data.deliveryDate &&
      data.endDate &&
      data.endDate <= data.deliveryDate
    ) {
      addIssue("durationDays", "Duration must end after the delivery date.");
    }

    // ----- Price per unit (currency-aware) -----
    const { currency, pricePerUnit, depositAmount, totalQuantity } = data;

    // KHR: whole numbers, at least 100.
    // USD: any amount greater than 0 (decimals allowed).
    if (currency === "KHR") {
      if (pricePerUnit < 100) {
        addIssue("pricePerUnit", "Price must be at least 100.");
      } else if (!Number.isInteger(pricePerUnit)) {
        addIssue("pricePerUnit", "Price in KHR cannot include decimal values.");
      } else if (pricePerUnit % 100 !== 0) {
        addIssue("pricePerUnit", "Price in KHR must be divisible by 100.");
      }
    } else if (pricePerUnit <= 0) {
      addIssue("pricePerUnit", "Price must be greater than 0.");
    }

    // ----- Deposit amount (currency-aware) -----
    // An actual money amount (not a percentage). KHR: at least 100, whole
    // numbers only. USD: at least 0.01 (decimals allowed).
    if (currency === "KHR") {
      if (depositAmount < 100) {
        addIssue("depositAmount", "Deposit amount must be at least 100.");
      } else if (!Number.isInteger(depositAmount)) {
        addIssue("depositAmount", "Deposit amount in KHR cannot include decimal values.");
      }
    } else if (depositAmount < 0.01) {
      addIssue("depositAmount", "Deposit amount must be at least 0.01.");
    }

    // Neither the price nor the deposit may exceed the total amount. Only
    // enforced once a real total exists, so an empty form is not flagged.
    const total = (totalQuantity > 0 ? totalQuantity : 0) * (pricePerUnit > 0 ? pricePerUnit : 0);

    if (total > 0) {
      if (pricePerUnit > total) {
        addIssue("pricePerUnit", "Price cannot be more than the total amount.");
      }

      if (depositAmount > total) {
        addIssue("depositAmount", "Deposit amount cannot be more than the total amount.");
      }
    }
  });

export type ContractFormInput = z.input<typeof contractSchema>;
export type ContractFormValues = z.output<typeof contractSchema>;
