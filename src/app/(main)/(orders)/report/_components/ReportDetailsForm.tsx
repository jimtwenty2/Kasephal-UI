"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronDown, MessageCircleWarning } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { showApiError } from "@/lib/apiToast";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { useI18n } from "@/lib/i18n/I18nContext";

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 250;

const TEXT = {
  reportDetails: { en: "Report Details", kh: "ព័ត៌មានលម្អិតនៃរបាយការណ៍" },
  reportSubtitle: {
    en: "Submit a report regarding contract dispute, payment issue, fraud, term violation, or delivery issue.",
    kh: "ដាក់បញ្ជូនរបាយការណ៍ទាក់ទងនឹងជម្លោះកិច្ចសន្យា បញ្ហាការបង់ប្រាក់ការក្លែងបន្លំ ការបំពានលក្ខខណ្ឌ ឬបញ្ហាការដឹកជញ្ជូន។",
  },
  issueDetails: { en: "Issue Details", kh: "ព័ត៌មានលម្អិតនៃបញ្ហា" },
  selectIssueType: { en: "Select issue type", kh: "ជ្រើសរើសប្រភេទបញ្ហា" },
  inputIssue: { en: "Input Issue", kh: "បញ្ចូលបញ្ហា" },
  inputIssuePlaceholder: { en: "Input your issue", kh: "បញ្ចូលបញ្ហារបស់អ្នក" },
  reportedUser: { en: "Reported User", kh: "អ្នកប្រើដែលត្រូវរាយការណ៍" },
  orderId: { en: "Order ID", kh: "លេខការបញ្ជាទិញ" },
  reportTitle: { en: "Report Title", kh: "ចំណងជើងរបាយការណ៍" },
  reportTitlePlaceholder: { en: "Enter report title", kh: "បញ្ចូលចំណងជើងរបាយការណ៍" },
  description: { en: "Description", kh: "សេចក្តីអធិប្បាយ" },
  descriptionPlaceholder: {
    en: "Provide information about what happened",
    kh: "សូមផ្តល់ព័ត៌មានអំពីអ្វីដែលបានកើតឡើង",
  },
  descriptionRequired: {
    en: "Please describe what happened",
    kh: "សូមពិពណ៌នាអំពីអ្វីដែលបានកើតឡើង",
  },
  cancel: { en: "CANCEL", kh: "បោះបង់" },
  submit: { en: "SUBMIT REPORT", kh: "ដាក់បញ្ជូនរបាយការណ៍" },
  submitting: { en: "SUBMITTING...", kh: "កំពុងដាក់បញ្ជូន..." },
  selectIssueTypeError: { en: "Please select issue type", kh: "សូមជ្រើសរើសប្រភេទបញ្ហា" },
  reportTitleRequired: { en: "Report title is required", kh: "ត្រូវការចំណងជើងរបាយការណ៍" },
  reportTitleMaxLength: {
    en: "Title cannot exceed 100 characters",
    kh: "ចំណងជើងមិនអាចលើសពី ១០០ តួអក្សរ",
  },
  reportTitleInvalidSpacing: {
    en: "Use only one space between words",
    kh: "សូមប្រើចន្លោះតែមួយរវាងពាក្យ",
  },
  descriptionMaxLength: {
    en: `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
    kh: `សេចក្តីអធិប្បាយមិនអាចលើសពី ${MAX_DESCRIPTION_LENGTH} តួអក្សរ`,
  },
  customIssueRequired: {
    en: "Please specify your custom issue",
    kh: "សូមបញ្ជាក់បញ្ហាផ្ទាល់ខ្លួនរបស់អ្នក",
  },
  customIssueTextOnly: {
    en: "Use letters and spaces only",
    kh: "សូមប្រើតែអក្សរ និងចន្លោះ",
  },
  atLeastOneImage: {
    en: "Please upload at least one image as evidence",
    kh: "សូមបង្ហោះរូបភាពយ៉ាងតិចមួយសន្លឹកជាភស្តុតាង",
  },
  fillAllFields: {
    en: "Please fill in all required fields correctly.",
    kh: "សូមបំពេញព័ត៌មានទាំងអស់ឱ្យបានត្រឹមត្រូវ។",
  },
  termConditionIssue: { en: "Term & Condition Violate Issue", kh: "បញ្ហាការបំពានលក្ខខណ្ឌ" },
  paymentIssue: { en: "Escrow / Payment Issue", kh: "បញ្ហា Escrow / ការបង់ប្រាក់" },
  contractIssue: { en: "Contract Issue", kh: "បញ្ហាកិច្ចសន្យា" },
  deliveryIssue: { en: "Delivery Issue", kh: "បញ្ហាការដឹកជញ្ជូន" },
  other: { en: "Other", kh: "ផ្សេងទៀត" },
} as const;

type Lang = "en" | "kh";
const t = (key: keyof typeof TEXT, lang: Lang): string => TEXT[key][lang];

const getIssueTypes = (lang: Lang) => [
  t("termConditionIssue", lang),
  t("paymentIssue", lang),
  t("contractIssue", lang),
  t("deliveryIssue", lang),
  t("other", lang),
];

const issueTypeToApiValue: Record<string, string> = {
  [TEXT.termConditionIssue.kh]: TEXT.termConditionIssue.en,
  [TEXT.paymentIssue.kh]: TEXT.paymentIssue.en,
  [TEXT.contractIssue.kh]: TEXT.contractIssue.en,
  [TEXT.deliveryIssue.kh]: TEXT.deliveryIssue.en,
  [TEXT.other.kh]: TEXT.other.en,
};

const toApiIssueType = (value: string) => issueTypeToApiValue[value] ?? value;
const normalizeSingleSpaces = (value: string) => value.replace(/ {2,}/g, " ");

const buildSchema = (lang: Lang) =>
  z
    .object({
      issueType: z.string().trim().min(1, t("selectIssueTypeError", lang)),
      customIssue: z
        .string()
        .trim()
        .refine((value) => value === "" || /^[\p{L}\s]+$/u.test(value), {
          message: t("customIssueTextOnly", lang),
        })
        .refine((value) => !/ {2,}/.test(value), {
          message: t("reportTitleInvalidSpacing", lang),
        })
        .optional(),
      reportTitle: z
        .string()
        .trim()
        .min(1, t("reportTitleRequired", lang))
        .max(MAX_TITLE_LENGTH, t("reportTitleMaxLength", lang))
        .refine((value) => !/\s{2,}/.test(value), {
          message: t("reportTitleInvalidSpacing", lang),
        }),
      description: z
        .string()
        .trim()
        .min(1, t("descriptionRequired", lang))
        .max(MAX_DESCRIPTION_LENGTH, t("descriptionMaxLength", lang))
        .refine((value) => !/ {2,}/.test(value), {
          message: t("reportTitleInvalidSpacing", lang),
        }),
    })
    .superRefine((data, ctx) => {
      const otherLabel = t("other", lang);
      if (data.issueType === otherLabel && (!data.customIssue || data.customIssue.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("customIssueRequired", lang),
          path: ["customIssue"],
        });
      }
    });

export type ReportFormValues = z.infer<ReturnType<typeof buildSchema>>;

type ReportDetailsFormProps = {
  onSubmit: (values: ReportFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<ReportFormValues>;
  isSubmitting?: boolean;
  reportedUserName?: string;
  orderCode?: string;
  /** Number of images currently attached in the media-upload panel. Used to require at least one image before submitting. */
  imageCount?: number;
};

export default function ReportDetailsForm({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  reportedUserName,
  orderCode,
  imageCount = 0,
}: ReportDetailsFormProps) {
  const { language } = useI18n();
  const lang: Lang = language === "kh" ? "kh" : "en";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(buildSchema(lang)),
    defaultValues: {
      issueType: "",
      customIssue: "",
      reportTitle: "",
      description: "",
      ...defaultValues,
    },
  });

  const currentIssueType = useWatch({ control, name: "issueType" }) || "";
  const reportTitleValue = useWatch({ control, name: "reportTitle" }) || "";
  const descriptionValue = useWatch({ control, name: "description" }) || "";
  const closeDropdown = useCallback(() => setIsDropdownOpen(false), []);
  const reportTitleField = register("reportTitle", {
    onChange: (event) => {
      const input = event.target as HTMLInputElement;
      const normalizedValue = normalizeSingleSpaces(input.value);

      if (input.value !== normalizedValue) {
        input.value = normalizedValue;
      }
    },
  });
  const customIssueField = register("customIssue", {
    onChange: (event) => {
      const input = event.target as HTMLInputElement;
      const normalizedValue = normalizeSingleSpaces(
        input.value.replace(/[^\p{L} ]/gu, ""),
      );

      if (input.value !== normalizedValue) {
        input.value = normalizedValue;
      }
    },
  });
  const descriptionField = register("description", {
    onChange: (event) => {
      const input = event.target as HTMLTextAreaElement;
      const normalizedValue = normalizeSingleSpaces(input.value);

      if (input.value !== normalizedValue) {
        input.value = normalizedValue;
      }
    },
  });

  useDismissibleDropdown({
    open: isDropdownOpen,
    containerRef: dropdownRef,
    onClose: closeDropdown,
  });

  const handleIssueTypeChange = (type: string) => {
    setValue("issueType", type, { shouldValidate: true, shouldDirty: true });
    if (type !== t("other", lang)) {
      setValue("customIssue", "", { shouldValidate: true, shouldDirty: true });
    }
  };

  const onInvalidSubmit = () => {
    showApiError(new Error(t("fillAllFields", lang)));
  };

  const handleValidSubmit = (values: ReportFormValues) => {
    if (imageCount <= 0) {
      showApiError(new Error(t("atLeastOneImage", lang)));
      return;
    }
    onSubmit({ ...values, issueType: toApiIssueType(values.issueType) });
  };

  return (
    <div className={`w-full ${lang === "kh" ? "font-khmer" : ""}`}>
      <form
        onSubmit={handleSubmit(handleValidSubmit, onInvalidSubmit)}
        className="flex w-full flex-col"
      >
        <div className="rounded-[20px] border border-[#d9e2ec] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircleWarning size={18} className="shrink-0 text-[#08743f]" />
            <h2 className="text-base font-bold text-[#2f3a45]">
              {t("reportDetails", lang)}
            </h2>
          </div>

          <p className="mb-5 text-sm leading-6 text-[#5b646f]">
            {t("reportSubtitle", lang)}
          </p>

          <div className="space-y-4">
            {/* Read-only context: who is being reported and on which order */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#08743f]">
                  {t("reportedUser", lang)}
                </label>
                <input
                  type="text"
                  value={reportedUserName ?? "—"}
                  readOnly
                  tabIndex={-1}
                  aria-readonly="true"
                  className="h-11 w-full cursor-default rounded-xl border border-[#d9e2ec] bg-[#f4f7f9] px-4 text-sm font-medium text-[#1f2933] outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#08743f]">
                  {t("orderId", lang)}
                </label>
                <input
                  type="text"
                  value={orderCode ?? "—"}
                  readOnly
                  tabIndex={-1}
                  aria-readonly="true"
                  className="h-11 w-full cursor-default rounded-xl border border-[#d9e2ec] bg-[#f4f7f9] px-4 text-sm font-bold text-[#08743f] outline-none"
                />
              </div>
            </div>

            {/* Report Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#08743f]">
                <span className="mr-1 text-red-500">*</span>
                {t("reportTitle", lang)}
              </label>
              <input
                {...reportTitleField}
                maxLength={MAX_TITLE_LENGTH}
                placeholder={t("reportTitlePlaceholder", lang)}
                className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-[#1f2933] outline-none transition placeholder:text-[#9ca3af] ${
                  errors.reportTitle
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#d9e2ec] focus:border-[#08743f]"
                }`}
              />
              <div className="mt-1.5 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                {errors.reportTitle ? (
                  <p className="text-xs font-medium text-red-500">
                    {errors.reportTitle.message}
                  </p>
                ) : (
                  <span />
                )}
                <p
                  className={`shrink-0 text-xs ${
                    reportTitleValue.length >= MAX_TITLE_LENGTH
                      ? "text-red-500"
                      : "text-[#6b7280]"
                  }`}
                >
                  {reportTitleValue.length}/{MAX_TITLE_LENGTH}
                </p>
              </div>
            </div>

            {/* Issue Type — custom styled dropdown */}
            <div>
              <h3 className="mb-2 text-sm font-bold text-[#08743f]">
                <span className="mr-1 text-red-500">*</span>
                {t("issueDetails", lang)}
              </h3>

              <div ref={dropdownRef} className="relative">
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-xl border bg-white px-4 text-left text-sm font-medium transition focus:outline-none ${
                    errors.issueType
                      ? "border-red-500"
                      : isDropdownOpen
                        ? "border-[#08743f]"
                        : "border-[#d9e2ec] hover:border-[#08743f]"
                  }`}
                >
                  <span className={`min-w-0 truncate ${currentIssueType ? "text-[#1f2933]" : "text-[#9ca3af]"}`}>
                    {currentIssueType || t("selectIssueType", lang)}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-[#6b7280] transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown panel */}
                {isDropdownOpen && (
                  <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-[260px] w-full overflow-y-auto overscroll-contain rounded-2xl border border-[#d9e2ec] bg-white shadow-lg">
                    {getIssueTypes(lang).map((type, index) => {
                      const isSelected = currentIssueType === type;
                      const isFirst = index === 0;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            handleIssueTypeChange(type);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 text-left text-sm leading-5 transition ${
                            isSelected
                              ? "bg-[#e8f5ee] font-semibold text-[#08743f]"
                              : "font-medium text-[#2f3a45] hover:bg-[#f4f7f9]"
                          } ${
                            isFirst ? "py-4" : "py-3.5"
                          }`}
                        >
                          <span>{type}</span>

                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {errors.issueType && (
                <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">
                  {errors.issueType.message}
                </p>
              )}
            </div>

            {/* Custom Issue (shown when "Other" is selected) */}
            {currentIssueType === t("other", lang) && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#08743f]">
                  <span className="mr-1 text-red-500">*</span>
                  {t("inputIssue", lang)}
                </label>
                <input
                  {...customIssueField}
                  placeholder={t("inputIssuePlaceholder", lang)}
                  className={`h-11 w-full rounded-xl border bg-white px-4 text-sm text-[#1f2933] outline-none transition placeholder:text-[#9ca3af] ${
                    errors.customIssue
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#d9e2ec] focus:border-[#08743f]"
                  }`}
                />
                {errors.customIssue && (
                  <p className="mt-1.5 pl-1 text-xs font-medium text-red-500">
                    {errors.customIssue.message}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#08743f]">
                <span className="mr-1 text-red-500">*</span>
                {t("description", lang)}
              </label>
              <textarea
                {...descriptionField}
                maxLength={MAX_DESCRIPTION_LENGTH}
                placeholder={t("descriptionPlaceholder", lang)}
                className={`min-h-[120px] w-full resize-y rounded-xl border bg-white p-4 text-sm text-[#1f2933] outline-none transition placeholder:text-[#9ca3af] ${
                  errors.description
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#d9e2ec] focus:border-[#08743f]"
                }`}
              />
              <div className="mt-1.5 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                {errors.description ? (
                  <p className="text-xs font-medium text-red-500">
                    {errors.description.message}
                  </p>
                ) : (
                  <span />
                )}
                <p
                  className={`shrink-0 text-xs ${
                    descriptionValue.length >= MAX_DESCRIPTION_LENGTH
                      ? "text-red-500"
                      : "text-[#6b7280]"
                  }`}
                >
                  {descriptionValue.length}/{MAX_DESCRIPTION_LENGTH}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-row items-center justify-center gap-4 md:justify-end md:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-[38px] w-[86px] rounded-xl border border-[#9ca3af] px-3 text-xs font-bold whitespace-nowrap text-[#1f2933] transition hover:bg-white disabled:opacity-50 md:h-11 md:w-auto md:px-6"
          >
            {t("cancel", lang)}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-[38px] w-[123px] items-center justify-center rounded-xl bg-[#f8bd4d] px-3 text-xs font-bold whitespace-nowrap text-[#1f2933] transition hover:bg-[#f5b437] disabled:opacity-50 md:h-11 md:w-auto md:min-w-[140px] md:px-6"
          >
            {isSubmitting ? t("submitting", lang) : t("submit", lang)}
          </button>
        </div>
      </form>
    </div>
  );
}
