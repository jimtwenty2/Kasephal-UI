"use client";

import Modal from "../shared/Modal";
import { useEffect, useMemo, useTransition, type ChangeEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DatePickerComponent } from "@/components/ui/DatePickerComponent";
import { pushToast } from "@/lib/toastStore";
import { MarketPriceRow } from "@/types/market-price-row";
import { Crop, CropType } from "@/types/cropType";
import { AdministrativeLocation } from "@/services/locationFilter.service";
import { updateMarketPriceAction } from "../../actions/update-market-price.action";
import { mapMarketPricesToRows } from "@/utils/market-price.mapper";
import { useMarketPriceText } from "../marketPriceText";

interface EditMarketPriceModalProps {
  open: boolean;
  onClose: () => void;
  row: MarketPriceRow | null;
  cropTypes: CropType[];
  crops: Crop[];
  provinces: AdministrativeLocation[];
  usdKhrRate: number;
  onUpdated: (row: MarketPriceRow) => void;
}

function toRegionEnum(region: string) {
  return region.trim().toUpperCase().replaceAll(" ", "_");
}

function toDateInputValue(value: string) {
  if (!value) return "";
  return value.split("T")[0] ?? "";
}

function toIsoDate(value: string) {
  if (!value) return new Date().toISOString();
  return new Date(`${value}T00:00:00Z`).toISOString();
}

function SelectArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="#5E6872"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function sanitizeNumericInput(value: string) {
  return value.replace(/[\s,]/g, "");
}

const NUMERIC_MIN = 100;
const NUMERIC_MAX = 500_000_000;

const numericFieldSchema = (label: string) =>
  z
    .string()
    .transform(sanitizeNumericInput)
    .refine((v) => v.length > 0, `${label} is required`)
    .refine((v) => !Number.isNaN(Number(v)), `${label} must be a valid number`)
    .refine((v) => Number(v) >= NUMERIC_MIN, `${label} must be at least ${NUMERIC_MIN.toLocaleString()}`)
    .refine((v) => Number(v) <= NUMERIC_MAX, `${label} cannot exceed ${NUMERIC_MAX.toLocaleString()}`);

const marketPriceFormSchema = z
  .object({
    currentPrice: numericFieldSchema("Current price"),
    minFloorPrice: numericFieldSchema("Min floor price"),
    priceThresholds: numericFieldSchema("Price threshold"),
    validityDate: z.string().min(1, "Validity date is required"),
  })
  .refine((data) => Number(data.minFloorPrice) <= Number(data.currentPrice), {
    message: "Min floor price cannot exceed the current price",
    path: ["minFloorPrice"],
  });

type MarketPriceFormValues = z.infer<typeof marketPriceFormSchema>;

export default function EditMarketPriceModal({
  open,
  onClose,
  row,
  cropTypes,
  crops,
  provinces,
  usdKhrRate,
  onUpdated,
}: EditMarketPriceModalProps) {
  const { t, fontClass } = useMarketPriceText();
  const [isPending, startTransition] = useTransition();

  const cropTypeName = useMemo(() => {
    if (!row) return "";
    return (
      cropTypes.find((type) => type.typeName === row.cropType)?.typeName ??
      row.cropType
    );
  }, [row, cropTypes]);

  const cropName = row?.cropName ?? "";
  const region = row ? toRegionEnum(row.region) : "";
  const unitType: "KG" | "TON" = row?.unit === "TON" ? "TON" : "KG";

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MarketPriceFormValues>({
    resolver: zodResolver(marketPriceFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      currentPrice: "",
      minFloorPrice: "",
      priceThresholds: "",
      validityDate: "",
    },
  });

  useEffect(() => {
    if (!row || !open) return;

    reset({
      currentPrice: String(row.currentPrice),
      minFloorPrice: String(row.minPrice),
      priceThresholds: String(row.priceThresholds),
      validityDate: toDateInputValue(row.validityDate),
    });
  }, [row, open, reset]);

  const registerNumeric = (name: "currentPrice" | "minFloorPrice" | "priceThresholds") => {
    const field = register(name);
    return {
      ...field,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        event.target.value = sanitizeNumericInput(event.target.value);
        return field.onChange(event);
      },
    };
  };

  const inputClass = (hasError: boolean) =>
    `h-[46px] w-full rounded-[9px] border bg-white px-3 text-[16px] font-medium text-[#59636D] outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-[#D5DCE5] focus:border-primary focus:ring-primary/10"
    }`;

  const onSubmit = (values: MarketPriceFormValues) => {
    if (!row) return;

    startTransition(async () => {
      const result = await updateMarketPriceAction([
        {
          marketPriceId: row.marketPriceId,
          cropName,
          cropType: cropTypeName,
          unitType,
          region,
          currencyCode: "KHR",
          currentPricePerUnit: Number(values.currentPrice),
          minFloorPrice: Number(values.minFloorPrice),
          validityDate: toIsoDate(values.validityDate),
          priceThresholds: Number(values.priceThresholds),
          scheduledAt: row.scheduledAt || new Date().toISOString(),
        },
      ]);

      if (!result.success) {
        pushToast({
          title: t("market.toast.updateFailed.title"),
          message: result.error || t("market.toast.updateFailed.message"),
          variant: "error",
        });
        return;
      }

      const updatedRow = mapMarketPricesToRows(result.payload, usdKhrRate)[0];

      if (updatedRow) {
        onUpdated(updatedRow);
      }

      pushToast({
        title: t("market.toast.marketUpdated.title"),
        message: `${cropName} ${t("market.toast.marketUpdated.message")}`,
        variant: "success",
      });
      onClose();
    });
  };

  const busy = isPending || isSubmitting;

  return (
    <Modal open={open} title={t("market.modal.editMarketPrice")} onClose={onClose}>
      <form
        className={`w-full max-w-[630px] px-3 pb-6 pt-5 ${fontClass}`}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div className="flex flex-col">
            <label className="mb-2 text-[14px] font-bold leading-none text-primary">
              <span className="text-red-500">*</span>{t("market.form.cropType")}
            </label>

            <div className="relative">
              <input
                type="text"
                value={cropTypeName}
                disabled
                className="h-12 w-full rounded-xl border border-[#CBD2E1] bg-gray-100 px-4 text-[#5F6B7A] cursor-not-allowed"
              />
              <SelectArrowIcon />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[14px] font-bold leading-none text-primary">
              <span className="text-red-500">*</span>{t("market.form.cropName")}
            </label>

            <div className="relative">
              <input
                type="text"
                value={cropName}
                disabled
                className="h-12 w-full rounded-xl border border-[#CBD2E1] bg-gray-100 px-4 text-[#5F6B7A] cursor-not-allowed"
              />
              <SelectArrowIcon />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[14px] font-bold leading-none text-primary">
              <span className="text-red-500">*</span>{t("market.form.region")}
            </label>

            <div className="relative">
              <input
                type="text"
                value={region.replaceAll("_", " ")}
                disabled
                className="h-12 w-full rounded-xl border border-[#CBD2E1] bg-gray-100 px-4 text-[#5F6B7A] cursor-not-allowed"
              />
              <SelectArrowIcon />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[14px] font-bold leading-none text-primary">
              <span className="text-red-500">*</span> {t("market.form.unitType")}
            </label>

            <div className="flex h-[46px] w-[138px] items-center justify-center rounded-[9px] border border-[#D5DCE5] bg-gray-100 text-[16px] font-bold text-[#59636D] cursor-not-allowed">
              {unitType}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[14px] font-bold leading-none text-primary">
              <span className="text-red-500">*</span> {t("market.form.currentPrice")}
            </label>

            <input
              {...registerNumeric("currentPrice")}
              type="text"
              inputMode="numeric"
              aria-invalid={!!errors.currentPrice}
              aria-describedby={errors.currentPrice ? "currentPrice-error" : undefined}
              className={inputClass(!!errors.currentPrice)}
            />
            {errors.currentPrice && (
              <p id="currentPrice-error" className="mt-1 text-[12px] font-medium text-red-500">
                {errors.currentPrice.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[14px] font-bold leading-none text-primary">
              <span className="text-red-500">*</span> {t("market.form.minFloorPrice")}
            </label>

            <input
              {...registerNumeric("minFloorPrice")}
              type="text"
              inputMode="numeric"
              aria-invalid={!!errors.minFloorPrice}
              aria-describedby={errors.minFloorPrice ? "minFloorPrice-error" : undefined}
              className={inputClass(!!errors.minFloorPrice)}
            />
            {errors.minFloorPrice && (
              <p id="minFloorPrice-error" className="mt-1 text-[12px] font-medium text-red-500">
                {errors.minFloorPrice.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[14px] font-bold leading-none text-primary">
              <span className="text-red-500">*</span> {t("market.form.priceThreshold")}
            </label>

            <input
              {...registerNumeric("priceThresholds")}
              type="text"
              inputMode="numeric"
              aria-invalid={!!errors.priceThresholds}
              aria-describedby={errors.priceThresholds ? "priceThresholds-error" : undefined}
              className={inputClass(!!errors.priceThresholds)}
            />
            {errors.priceThresholds && (
              <p id="priceThresholds-error" className="mt-1 text-[12px] font-medium text-red-500">
                {errors.priceThresholds.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-2 text-[14px] font-bold leading-none text-primary">
              <span className="text-red-500">*</span> {t("market.form.validityDate")}
            </label>

            <Controller
              name="validityDate"
              control={control}
              render={({ field }) => (
                <DatePickerComponent
                  id="validityDate"
                  name={field.name}
                  value={field.value}
                  label={t("market.form.validityDate")}
                  invalid={!!errors.validityDate}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.validityDate && (
              <p id="validityDate-error" className="mt-1 text-[12px] font-medium text-red-500">
                {errors.validityDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[38px] rounded-[8px] bg-[#858585] px-7 text-[16px] font-bold text-white transition hover:bg-[#737373]"
          >
            {t("market.action.cancel")}
          </button>

          <button
            type="submit"
            disabled={busy}
            className="h-[38px] rounded-[8px] bg-primary px-8 text-[16px] font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? t("market.action.saving") : t("market.action.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}