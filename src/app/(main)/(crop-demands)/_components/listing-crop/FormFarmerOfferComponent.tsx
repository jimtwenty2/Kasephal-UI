"use client";

import React, { useEffect } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import { DatePickerComponent } from "@/components/ui/DatePickerComponent";

const OFFER_FORM_TEXT = {
  "offerForm.updateOffer": { en: "Update Offer", kh: "កែប្រែសំណើ" },
  "offerForm.proposeOffer": { en: "Propose Offer", kh: "ដាក់សំណើ" },
  "offerForm.updateDescription": { en: "Modify your details below to update your running demand application.", kh: "កែប្រែព័ត៌មានខាងក្រោម ដើម្បីធ្វើបច្ចុប្បន្នភាពសំណើតម្រូវការរបស់អ្នក។" },
  "offerForm.proposeDescription": { en: "Fill in your details to propose an offer for this crop demand.", kh: "បំពេញព័ត៌មានរបស់អ្នក ដើម្បីដាក់សំណើសម្រាប់តម្រូវការដំណាំនេះ។" },
  "offerForm.proposedUnitPrice": { en: "Proposed Unit Price", kh: "តម្លៃឯកតាដែលបានស្នើ" },
  "offerForm.offeredQuantity": { en: "Offered Quantity", kh: "បរិមាណដែលបានស្នើ" },
  "offerForm.estimatedDeliveryDate": { en: "Estimated Delivery Date", kh: "កាលបរិច្ឆេទដឹកជញ្ជូនប៉ាន់ស្មាន" },
  "offerForm.messageOptional": { en: "Message (Optional)", kh: "សារ (មិនចាំបាច់)" },
  "offerForm.messagePlaceholder": { en: "Enter additional delivery details or specifications here...", kh: "បញ្ចូលព័ត៌មានលម្អិតអំពីការដឹកជញ្ជូន ឬលក្ខណៈបន្ថែមនៅទីនេះ..." },
  "offerForm.cancel": { en: "CANCEL", kh: "បោះបង់" },
  "offerForm.processing": { en: "Processing...", kh: "កំពុងដំណើរការ..." },
  "offerForm.unit.KG": { en: "KG", kh: "គីឡូក្រាម" },
  "offerForm.unit.TON": { en: "TON", kh: "តោន" },
  "offerForm.error.priceNumber": { en: "Price must be the number", kh: "តម្លៃត្រូវតែជាលេខ។" },
  "offerForm.error.pricePositive": { en: "Price must be a positive number", kh: "តម្លៃត្រូវតែជាលេខវិជ្ជមាន។" },
  "offerForm.error.quantityNumber": { en: "Quantity must be the number", kh: "បរិមាណត្រូវតែជាលេខ។" },
  "offerForm.error.quantityPositive": { en: "Quantity must be greater than 0", kh: "បរិមាណត្រូវតែធំជាង 0។" },
  "offerForm.error.deliveryDateRequired": { en: "Estimated delivery date is required", kh: "ត្រូវការកាលបរិច្ឆេទដឹកជញ្ជូនប៉ាន់ស្មាន។" },
  "offerForm.error.messageMax": { en: "message not exceed 500 character", kh: "សារមិនត្រូវលើសពី 500 តួអក្សរទេ។" },
  "offerForm.error.khrNoDecimal": { en: "Price in KHR cannot include decimal values", kh: "តម្លៃជារៀលមិនអាចមានខ្ទង់ទសភាគបានទេ។" },
  "offerForm.error.khrMin": { en: "Price in KHR must be at least 100", kh: "តម្លៃជារៀលត្រូវយ៉ាងហោចណាស់ 100។" },
  "offerForm.error.khrDivisible": { en: "Price in KHR must be divisible by 100", kh: "តម្លៃជារៀលត្រូវតែចែកដាច់នឹង 100។" },
} as const;

function getOfferFormText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    OFFER_FORM_TEXT[key as keyof typeof OFFER_FORM_TEXT]?.[lang] ?? key;
}

function translateOfferUnit(t: (key: string) => string, unit?: string) {
  if (!unit) return "";

  const key = `offerForm.unit.${unit}`;
  const translated = t(key);
  return translated === key ? unit : translated;
}

function translateOfferFormError(t: (key: string) => string, message?: string) {
  if (!message) return "";

  const errorKeyByMessage: Record<string, string> = {
    "Price must be the number": "offerForm.error.priceNumber",
    "Price must be a positive number": "offerForm.error.pricePositive",
    "Quantity must be the number": "offerForm.error.quantityNumber",
    "Quantity must be greater than 0": "offerForm.error.quantityPositive",
    "Estimated delivery date is required":
      "offerForm.error.deliveryDateRequired",
    "message not exceed 500 character": "offerForm.error.messageMax",
    "Price in KHR cannot include decimal values":
      "offerForm.error.khrNoDecimal",
    "Price in KHR must be at least 100": "offerForm.error.khrMin",
    "Price in KHR must be divisible by 100": "offerForm.error.khrDivisible",
  };

  const key = errorKeyByMessage[message];
  return key ? t(key) : message;
}

function getOfferFormFontScopeClass(language: string) {
  return language === "kh"
    ? "[&_*]:!font-khmer [&_.title]:!font-khmer [&_.sub-title]:!font-khmer [&_.heading]:!font-khmer [&_.description]:!font-khmer"
    : "";
}

const offerSchema = z.object({
  currencyCode: z.enum(["KHR", "USD"]),

  proposedPrice: z
    .number({ message: "Price must be the number" })
    .positive("Price must be a positive number"),

  offeredQuantity: z
    .number({ message: "Quantity must be the number" })
    .positive("Quantity must be greater than 0"),

  unitType: z.enum(["KG", "TON"]),
  deliveryDate: z.string().min(1, "Estimated delivery date is required"),
  message: z.string().max(500,"message not exceed 500 character").optional(),
}).superRefine((data, ctx) => {
  if (data.currencyCode !== "KHR") return;

  if (!Number.isInteger(data.proposedPrice)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["proposedPrice"],
      message: "Price in KHR cannot include decimal values",
    });
  } else if (data.proposedPrice < 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["proposedPrice"],
      message: "Price in KHR must be at least 100",
    });
  } else if (data.proposedPrice % 100 !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["proposedPrice"],
      message: "Price in KHR must be divisible by 100",
    });
  }
});

export type OfferFormValues = z.infer<typeof offerSchema>;

interface SubmitOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfferFormValues) => void;
  initialData?: Partial<OfferFormValues>;
  isUpdating?: boolean;
}

export default function SubmitOfferModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isUpdating = false,
}: SubmitOfferModalProps) {
  const { language } = useI18n();
  const t = getOfferFormText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const fontScopeClass = getOfferFormFontScopeClass(language);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      currencyCode: "KHR",
      proposedPrice: undefined,
      offeredQuantity: undefined,
      unitType: "KG",
      deliveryDate: "",
      message: "",
    },
  });

  const currentCurrencyCode = useWatch({ control, name: "currencyCode" });
  const currentUnitType = useWatch({ control, name: "unitType" });
  const currentUnitLabel = translateOfferUnit(t, currentUnitType || "KG");
  const unitOptionsLabel = (["KG", "TON"] as const)
    .map((unit) => translateOfferUnit(t, unit))
    .join("/");

  useEffect(() => {
    if (isOpen) {
      reset({
        currencyCode: initialData?.currencyCode || "KHR",
        proposedPrice: initialData?.proposedPrice,
        offeredQuantity: initialData?.offeredQuantity,
        unitType: initialData?.unitType || "KG",
        deliveryDate: initialData?.deliveryDate || "",
        message: initialData?.message || "",
      });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onInvalid = (formErrors: FieldErrors<OfferFormValues>) => {
    const firstErrorName = Object.keys(formErrors)[0] as
      | Path<OfferFormValues>
      | undefined;

    if (firstErrorName) setFocus(firstErrorName);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-9000 flex h-full w-full items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      {/* Backdrop structural catch-click close container */}
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />

      <div className={`relative z-10 w-full max-w-170 rounded-[24px] border border-light-grey bg-white p-6 shadow-xl md:p-8 ${fontClass} ${fontScopeClass}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1 text-muted transition-colors hover:text-dark-grey"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="mb-6">
          <h2 className="heading text-primary-heading font-bold tracking-tight">
            {isUpdating ? t("offerForm.updateOffer") : t("offerForm.proposeOffer")}
          </h2>
          <p className="sub-title mt-1 text-muted">
            {isUpdating
              ? t("offerForm.updateDescription")
              : t("offerForm.proposeDescription")}
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
          className="flex flex-col gap-y-5 text-dark-grey font-semibold"
        >
          {/* Unit Price Field */}
          <div className="flex flex-col gap-y-2">
            <label className="sub-title flex items-center gap-x-1 text-primary font-bold">
              <span className="font-bold text-rose-500">*</span> {t("offerForm.proposedUnitPrice")} ({currentCurrencyCode}/{currentUnitLabel})
            </label>

            <div className="relative w-full">
              <input
                type="text"
                inputMode={currentCurrencyCode === "KHR" ? "numeric" : "decimal"}
                pattern={currentCurrencyCode === "KHR" ? "[0-9]*" : "[0-9.]*"}
                step={currentCurrencyCode === "KHR" ? "100" : "0.01"}
                min={currentCurrencyCode === "KHR" ? 100 : 0.01}
                placeholder={currentCurrencyCode === "USD" ? "3.20" : "12000"}
                {...register("proposedPrice", { valueAsNumber: true })}
                className={`sub-title w-full rounded-xl border bg-white py-3 pl-4 pr-32 text-dark-grey font-medium shadow-2xs focus:outline-none ${
                  errors.proposedPrice
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-light-grey focus:border-primary"
                }`}
              />

              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-x-1 rounded-lg border border-light-grey bg-gray-50 p-1">
                {(["KHR", "USD"] as const).map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() =>
                      setValue("currencyCode", currency, {
                        shouldValidate: true,
                      })
                    }
                    className={`rounded-md px-2 py-1 text-[11px] font-bold transition-all ${
                      currentCurrencyCode === currency
                        ? "bg-primary text-white shadow-3xs"
                        : "text-muted hover:bg-gray-200"
                    }`}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            </div>

            {errors.proposedPrice && (
              <span className="sub-title mt-0.5 text-xs text-rose-500 font-semibold">
                {translateOfferFormError(t, errors.proposedPrice.message)}
              </span>
            )}
          </div>

          {/* Quantity Field */}
          <div className="flex flex-col gap-y-2">
            <label className="sub-title flex items-center gap-x-1 text-primary font-bold">
              <span className="font-bold text-rose-500">*</span> {t("offerForm.offeredQuantity")} ({unitOptionsLabel})
            </label>

            <div className="relative flex w-full items-center">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9.]*"
                placeholder="5000"
                {...register("offeredQuantity", { valueAsNumber: true })}
                className={`sub-title w-full rounded-xl border bg-white py-3 pl-4 pr-20 text-dark-grey font-medium shadow-2xs focus:outline-none ${
                  errors.offeredQuantity
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-light-grey focus:border-primary"
                }`}
              />

              <div className="absolute right-2 flex gap-x-1 rounded-lg border border-light-grey bg-gray-50 p-1">
                {(["KG", "TON"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() =>
                      setValue("unitType", unit, { shouldValidate: true })
                    }
                    className={`rounded-md px-2 py-1 text-[11px] font-bold transition-all ${
                      currentUnitType === unit
                        ? "bg-primary text-white shadow-3xs"
                        : "text-muted hover:bg-gray-200"
                    }`}
                  >
                    {translateOfferUnit(t, unit)}
                  </button>
                ))}
              </div>
            </div>

            {errors.offeredQuantity && (
              <span className="sub-title mt-0.5 text-xs text-rose-500 font-semibold">
                {translateOfferFormError(t, errors.offeredQuantity.message)}
              </span>
            )}
          </div>

          {/* Estimated Delivery Date Field */}
          <div className="flex flex-col gap-y-2">
            <label className="sub-title flex items-center gap-x-1 text-primary font-bold">
              <span className="font-bold text-rose-500">*</span> {t("offerForm.estimatedDeliveryDate")}
            </label>

            <Controller
              name="deliveryDate"
              control={control}
              render={({ field }) => (
                <DatePickerComponent
                  key={field.value ?? "empty-offer-delivery-date"}
                  id="offer-delivery-date"
                  label={t("offerForm.estimatedDeliveryDate")}
                  value={field.value ?? ""}
                  invalid={Boolean(errors.deliveryDate)}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  popoverClassName="w-72!"
                />
              )}
            />

            {errors.deliveryDate && (
              <span className="sub-title mt-0.5 text-xs text-rose-500 font-semibold">
                {translateOfferFormError(t, errors.deliveryDate.message)}
              </span>
            )}
          </div>

          {/* Optional Message Field */}
          <div className="flex flex-col gap-y-2">
            <label className="sub-title text-primary font-bold">
              {t("offerForm.messageOptional")}
            </label>

            <textarea
              rows={3}
              placeholder={t("offerForm.messagePlaceholder")}
              {...register("message")}
              className="sub-title w-full resize-none rounded-xl border border-light-grey bg-white p-4 text-dark-grey font-medium shadow-2xs focus:border-primary focus:outline-none"
            />

            {errors.message && (
              <span className="sub-title mt-0.5 text-xs text-rose-500 font-semibold">
                {translateOfferFormError(t, errors.message.message)}
              </span>
            )}
          </div>

          {/* Actions Footer Blocks */}
          <div className="mt-4 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="sub-title w-full min-w-30 rounded-xl border border-secondary-body/40 bg-white px-6 py-3 text-center text-secondary-body shadow-3xs transition-all hover:bg-gray-50 active:scale-98 disabled:opacity-50 sm:w-auto font-bold"
            >
              {t("offerForm.cancel")}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="sub-title w-full min-w-40 rounded-xl bg-secondary px-6 py-3 text-center text-primary-heading shadow-3xs transition-all hover:brightness-95 active:scale-98 disabled:opacity-50 sm:w-auto font-bold"
            >
              {isSubmitting
                ? t("offerForm.processing")
                : isUpdating
                  ? t("offerForm.updateOffer")
                  : t("offerForm.proposeOffer")}
            </button>
          </div>
        </form>

    
      </div>
    </div>
  );
}
