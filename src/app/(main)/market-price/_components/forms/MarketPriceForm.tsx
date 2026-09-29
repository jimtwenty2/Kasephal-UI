"use client";
import { useEffect, useMemo, useActionState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormRegisterReturn } from "react-hook-form";

import { createMarketPriceAction } from "@/action/market-price/create-market-price.action";
import { Crop, CropType } from "@/types/cropType";
import { AdministrativeLocation } from "@/services/locationFilter.service";
import { pushToast } from "@/lib/toastStore";
import { PROVINCE_TO_REGION } from "@/utils/province-region-mapper";
import { useMarketPriceText } from "../marketPriceText";
import { CustomFilterSelect } from "../../../(crop-demands)/_components/CustomFilterSelect";
import { DatePickerComponent } from "@/components/ui/DatePickerComponent";
import {
  marketPriceFormSchema,
  MarketPriceFormValues,
  MarketPriceFormOutput,
  MAX_PRICE_KHR,
  MIN_PRICE_KHR,
} from "@/schema/market-price-form.schema";

const initialState = {
  success: false,
  error: "",
};

const UNIT_TYPES = ["KG", "TON"] as const;

interface MarketPriceFormProps {
  onCancel?: () => void;
  cropTypes: CropType[];
  crops: Crop[];
  provinces: AdministrativeLocation[];
}

export default function MarketPriceForm({
  onCancel,
  cropTypes,
  crops,
  provinces,
}: MarketPriceFormProps) {
  const { t, fontClass } = useMarketPriceText();
  const router = useRouter();

  const [state, formAction, isActionPending] = useActionState(
    createMarketPriceAction,
    initialState,
  );
  const [isTransitionPending, startTransition] = useTransition();
  const pending = isActionPending || isTransitionPending;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MarketPriceFormValues, unknown, MarketPriceFormOutput>({
    resolver: zodResolver(marketPriceFormSchema),
    mode: "onChange",
    defaultValues: {
      cropTypeId: "",
      cropId: "",
      region: "",
      unitType: "KG",
      validityDate: "",
      currentPricePerUnit: "",
      minFloorPrice: "",
      priceThresholds: "",
    },
  });

  const cropTypesById = useMemo(
    () => new Map(cropTypes.map((type) => [type.cropTypeId, type])),
    [cropTypes],
  );

  const cropsById = useMemo(
    () => new Map(crops.map((crop) => [crop.cropId, crop])),
    [crops],
  );

  const cropsByTypeId = useMemo(() => {
    const map = new Map<string, Crop[]>();
    for (const crop of crops) {
      const bucket = map.get(crop.cropTypeId);
      if (bucket) {
        bucket.push(crop);
      } else {
        map.set(crop.cropTypeId, [crop]);
      }
    }
    return map;
  }, [crops]);

  const provinceByRegionValue = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of provinces) {
      const value =
        PROVINCE_TO_REGION[p.nameEn] ?? p.nameEn.toUpperCase().replaceAll(" ", "_");
      map.set(value, p.nameEn);
    }
    return map;
  }, [provinces]);

  const selectedCropTypeId = watch("cropTypeId");
  const selectedCropId = watch("cropId");
  const selectedRegionValue = watch("region");
  const unitType = watch("unitType");

  const selectedCropType = cropTypesById.get(selectedCropTypeId);
  const selectedCropTypeName = selectedCropType?.typeName ?? "";

  const filteredCrops = useMemo(
    () => (selectedCropTypeId ? cropsByTypeId.get(selectedCropTypeId) ?? [] : []),
    [selectedCropTypeId, cropsByTypeId],
  );

  const selectedCrop = cropsById.get(selectedCropId);
  const selectedCropName = selectedCrop?.cropName ?? "";

  const cropTypeOptions = useMemo(
    () => cropTypes.map((type) => type.typeName),
    [cropTypes],
  );

  const cropNameOptions = useMemo(
    () => filteredCrops.map((crop) => crop.cropName),
    [filteredCrops],
  );

  const regionOptions = useMemo(
    () => provinces.map((p) => p.nameEn),
    [provinces],
  );

  const selectedRegionDisplay = provinceByRegionValue.get(selectedRegionValue) ?? "";

  useEffect(() => {
    if (state.success) {
      pushToast({
        title: t("market.toast.marketAdded.title"),
        message: `${selectedCropName} ${t("market.toast.marketAdded.message")}`,
        variant: "success",
      });
      onCancel?.();
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  useEffect(() => {
    if (state.error) {
      pushToast({
        title: t("market.toast.marketAddFailed.title"),
        message: state.error,
        variant: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.error]);

  const handleCropTypeChange = useCallback(
    (typeName: string) => {
      const type = cropTypes.find((t) => t.typeName === typeName);
      setValue("cropTypeId", type?.cropTypeId ?? "", { shouldValidate: true });
      setValue("cropId", "", { shouldValidate: true });
    },
    [cropTypes, setValue],
  );

  const handleCropNameChange = useCallback(
    (cropName: string) => {
      const crop = filteredCrops.find((c) => c.cropName === cropName);
      setValue("cropId", crop?.cropId ?? "", { shouldValidate: true });
    },
    [filteredCrops, setValue],
  );

  const handleRegionChange = useCallback(
    (nameEn: string) => {
      const province = provinces.find((p) => p.nameEn === nameEn);
      if (!province) return;
      const value =
        PROVINCE_TO_REGION[province.nameEn] ??
        province.nameEn.toUpperCase().replaceAll(" ", "_");
      setValue("region", value, { shouldValidate: true });
    },
    [provinces, setValue],
  );

  const handleUnitTypeChange = useCallback(
    (value: (typeof UNIT_TYPES)[number]) => {
      setValue("unitType", value, { shouldValidate: true });
    },
    [setValue],
  );

  const handleValidSubmit = handleSubmit((values) => {
    const cropType = cropTypesById.get(values.cropTypeId);
    const crop = cropsById.get(values.cropId);

    const formData = new FormData();
    formData.set("cropType", cropType?.typeName ?? "");
    formData.set("cropName", crop?.cropName ?? "");
    formData.set("region", values.region);
    formData.set("unitType", values.unitType);
    formData.set("validityDate", values.validityDate);
    formData.set("currentPricePerUnit", String(values.currentPricePerUnit));
    formData.set("minFloorPrice", String(values.minFloorPrice));
    formData.set("priceThresholds", String(values.priceThresholds));

    startTransition(() => {
      formAction(formData);
    });
  });

  return (
    <form
      onSubmit={handleValidSubmit}
      className={`w-full max-w-[720px] px-2 pb-5 pt-5 overflow-y-auto ${fontClass}`}
      noValidate
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-bold leading-none text-primary">
            <span className="text-red-500">* </span>
            {t("market.form.cropType")}
          </span>
          <CustomFilterSelect
            label={t("market.form.cropType")}
            options={cropTypeOptions}
            selected={selectedCropTypeName}
            onChange={handleCropTypeChange}
            placeholder={t("market.select")}
            labelClassName="hidden"
          />
          <FieldError message={errors.cropTypeId?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-bold leading-none text-primary">
            <span className="text-red-500">* </span>
            {t("market.form.cropName")}
          </span>
          <CustomFilterSelect
            label={t("market.form.cropName")}
            options={cropNameOptions}
            selected={selectedCropName}
            onChange={handleCropNameChange}
            disabled={!selectedCropTypeId}
            placeholder={t("market.select")}
            labelClassName="hidden"
          />
          <FieldError message={errors.cropId?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-bold leading-none text-primary">
            <span className="text-red-500">* </span>
            {t("market.form.region")}
          </span>
          <CustomFilterSelect
            label={t("market.form.region")}
            options={regionOptions}
            selected={selectedRegionDisplay}
            onChange={handleRegionChange}
            placeholder={t("market.select.region")}
            labelClassName="hidden"
          />
          <FieldError message={errors.region?.message} />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 text-[14px] font-bold leading-none text-primary">
            <span className="text-red-500">* </span>
            {t("market.form.unitType")}
          </label>

          <div className="flex h-11.5 w-34.5 items-center rounded-[9px] border border-[#D5DCE5] bg-white p-[5px]">
            {UNIT_TYPES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleUnitTypeChange(value)}
                className={`h-full flex-1 rounded-2xl text-[16px] font-bold transition ${
                  unitType === value
                    ? "bg-primary text-white"
                    : "bg-[#EAF2EF] text-[#59636D]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <PriceField
          id="currentPricePerUnit"
          label={t("market.form.currentPrice")}
          placeholder={t("market.form.currentPrice.placeholder")}
          error={errors.currentPricePerUnit?.message}
          register={register("currentPricePerUnit")}
        />

        <PriceField
          id="minFloorPrice"
          label={t("market.form.minFloorPrice")}
          placeholder={t("market.form.minFloorPrice.placeholder")}
          error={errors.minFloorPrice?.message}
          register={register("minFloorPrice")}
        />

        <PriceField
          id="priceThresholds"
          label={t("market.form.priceThreshold")}
          placeholder={t("market.form.priceThreshold.placeholder")}
          error={errors.priceThresholds?.message}
          register={register("priceThresholds")}
        />

        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-bold leading-none text-primary">
            <span className="text-red-500">* </span>
            {t("market.form.validityDate")}
          </span>
          <Controller
            name="validityDate"
            control={control}
            render={({ field }) => (
              <DatePickerComponent
                id="validityDate"
                value={field.value}
                label={t("market.form.validityDate")}
                onChange={field.onChange}
                clearable
              />
            )}
          />
          <FieldError message={errors.validityDate?.message} />
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-4 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[14px] font-medium text-red-600">
          <ExclamationIcon />
          {state.error}
        </p>
      )}

      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-[38px] rounded-xl bg-[#858585] px-4 text-[16px] font-bold text-white transition hover:bg-[#737373]"
        >
          {t("market.action.cancel")}
        </button>

        <button
          type="submit"
          disabled={pending}
          className="h-[38px] rounded-xl bg-primary px-6 text-[16px] font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? t("market.action.saving") : t("market.action.save")}
        </button>
      </div>
    </form>
  );
}

function priceInputClass(hasError: boolean) {
  const base =
    "h-[46px] w-full rounded-[9px] border bg-white px-3 text-[16px] font-medium outline-none transition placeholder:text-[#59636D] focus:ring-2";
  return hasError
    ? `${base} border-red-400 text-[#59636D] focus:border-red-500 focus:ring-red-200`
    : `${base} border-[#D5DCE5] text-[#59636D] focus:border-primary focus:ring-primary/10`;
}

function PriceField({
  id,
  label,
  placeholder,
  error,
  register,
}: {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-2 text-[14px] font-bold leading-none text-primary">
        <span className="text-red-500">* </span>
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        aria-invalid={!!error}
        className={priceInputClass(!!error)}
        {...register}
      />
      <FieldError message={error} />
      <PriceHint />
    </div>
  );
}

function PriceHint() {
  return (
    <p className="mt-1 text-[12px] font-medium text-[#9AA3AE]">
      {MIN_PRICE_KHR.toLocaleString()} – {MAX_PRICE_KHR.toLocaleString()} KHR
    </p>
  );
}

function ExclamationIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="mt-px h-4 w-4 shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" aria-live="polite" className="mt-1 flex items-start gap-1 text-[12px] font-medium text-red-500">
      <span aria-hidden="true"></span> {message}
    </p>
  );
}