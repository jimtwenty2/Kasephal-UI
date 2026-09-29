// "use client";

// import { useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Controller, useForm, useWatch } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   UserGroupIcon,
//   ScaleIcon,
//   BanknotesIcon,
//   CalendarDaysIcon,
// } from "@heroicons/react/24/outline";

// import { UnitToggle } from "./UnitToggle";
// import { CurrencyToggle } from "./CurrencyToggle";
// import TermsConditionPopup from "./TermsConditionPopup";
// import {
//   createContractService,
//   updateContractService,
// } from "@/action/contract.action";
// import { showApiToast } from "@/lib/apiToast";
// import {
//   contractSchema,
//   type ContractFormInput,
//   type ContractFormValues,
// } from "@/schema/contract.schema";

// // String-shaped values used to prefill the form in edit mode.
// type ContractInitial = {
//   unitType: "KG" | "TON";
//   currency: "KHR" | "USD";
//   totalQuantity: string;
//   pricePerUnit: string;
//   depositAmount: string;
//   deliveryDate: string;
//   startDate: string;
//   endDate: string;
// };

// type Props = {
//   contractId?: string;
//   chatRoomId?: string;
//   postId?: string;
//   farmerId?: string;
//   buyerName?: string;
//   farmerName?: string;
//   cropName?: string;
//   cropType?: string;
//   unitType?: "KG" | "TON";
//   requestChangeMessage?: string | null;
//   initial?: ContractInitial;
// };

// export default function CreateContract({
//   contractId,
//   chatRoomId,
//   postId,
//   farmerId,
//   buyerName = "Buyer",
//   farmerName = "Farmer",
//   cropName = "—",
//   cropType = "—",
//   unitType: initialUnitType = "KG",
//   requestChangeMessage,
//   initial,
// }: Props) {
//   const router = useRouter();

//   const isEditMode = Boolean(contractId);

//   const [termsOpen, setTermsOpen] = useState(false);

//   // Contract creation day — the earliest allowed start date, and the default
//   // shown in the Start Date field instead of an empty mm/dd/yyyy.
//   const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

//   const {
//     control,
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<ContractFormInput, object, ContractFormValues>({
//     resolver: zodResolver(contractSchema),
//     // Validate in real time as the user types (and on blur), so the red
//     // message appears the moment a value is wrong — not only after submit.
//     mode: "onChange",
//     defaultValues: {
//       unitType: initial?.unitType ?? initialUnitType,
//       currency: initial?.currency ?? "USD",
//       totalQuantity: initial?.totalQuantity ?? "",
//       pricePerUnit: initial?.pricePerUnit ?? "",
//       depositAmount: initial?.depositAmount ?? "",
//       deliveryDate: initial?.deliveryDate ?? "",
//       startDate: initial?.startDate ?? today,
//       endDate: initial?.endDate ?? "",
//       agreed: false,
//     },
//   });

//   // Create needs chat ids (POST body); edit only needs the contract id (PUT).
//   const hasContext = isEditMode
//     ? Boolean(contractId)
//     : Boolean(chatRoomId && postId && farmerId);

//   // Live values for the running totals and unit/currency labels.
//   const unitType = useWatch({ control, name: "unitType" });
//   const currency = useWatch({ control, name: "currency" });
//   const totalQuantity = useWatch({ control, name: "totalQuantity" });
//   const pricePerUnit = useWatch({ control, name: "pricePerUnit" });
//   const depositAmount = useWatch({ control, name: "depositAmount" });
//   const startDate = useWatch({ control, name: "startDate" });
//   const deliveryDate = useWatch({ control, name: "deliveryDate" });

//   const currencySymbol = currency === "USD" ? "$" : "៛";

//   const quantityNumber = Number(totalQuantity) || 0;
//   const priceNumber = Number(pricePerUnit) || 0;
//   const depositNumber = Number(depositAmount) || 0;

//   const totalPrice = quantityNumber * priceNumber;
//   const remaining = Math.max(0, totalPrice - depositNumber);

//   const formatMoney = (value: number) =>
//     `${currencySymbol}${value.toLocaleString("en-US", {
//       maximumFractionDigits: 2,
//     })}`;

//   const onSubmit = async (values: ContractFormValues) => {
//     if (!hasContext) {
//       showApiToast(
//         { success: false },
//         {
//           successTitle: "Contract created",
//           errorTitle: "Missing chat context",
//           errorMessage:
//             "Open this page from a chat's “Create Contract” button to send a contract.",
//         }
//       );
//       return;
//     }

//     const termValues = {
//       unitType: values.unitType,
//       currencyCode: values.currency,
//       pricePerUnit: values.pricePerUnit,
//       totalQuantity: values.totalQuantity,
//       depositAmount: values.depositAmount,
//       deliveryDate: new Date(values.deliveryDate).toISOString(),
//       startDate: new Date(values.startDate).toISOString(),
//       endDate: new Date(values.endDate).toISOString(),
//     };

//     const result = isEditMode
//       ? await updateContractService(contractId!, termValues)
//       : await createContractService({
//           ...termValues,
//           farmerId: farmerId!,
//           postId: postId!,
//           chatRoomId: chatRoomId!,
//         });

//     const ok = showApiToast(result, {
//       successTitle: isEditMode ? "Contract updated" : "Contract sent",
//       successMessage: isEditMode
//         ? "Your changes were sent to the farmer for review."
//         : "Your contract was sent to the farmer for review.",
//       errorTitle: isEditMode
//         ? "Could not update contract"
//         : "Could not create contract",
//       errorMessage: result.message ?? "Please try again.",
//     });

//     if (ok) {
//       router.push(
//         chatRoomId
//           ? `/chat?chatRoomId=${chatRoomId}`
//           : `/digital-contract/${result.contractId ?? contractId}`
//       );
//       router.refresh();
//     }
//   };

//   return (
//     <main className="px-0">
//       <div className="mx-auto w-full font-medium">
//         <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//           <div>
//             <p className="text-[13px] font-bold uppercase tracking-wide text-primary">
//               Smart Contract
//             </p>
//             <h1 className="mt-2 text-[34px] font-black text-primary-heading">
//               {isEditMode ? "Edit Digital Contract" : "Create Digital Contract"}
//             </h1>
//             <p className="mt-2 text-[16px] text-description-text">
//               {isEditMode
//                 ? "Update the terms and resend the contract to the farmer for review."
//                 : "Review contract information before sending it to the farmer."}
//             </p>
//           </div>

//           <div className="rounded-full bg-primary/10 px-5 py-3 text-[14px] font-bold text-primary">
//             {isEditMode ? "REQUEST CHANGE" : "DRAFT"}
//           </div>
//         </div>

//         {isEditMode && requestChangeMessage && (
//           <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
//             <div className="mb-2 inline-flex rounded-full bg-[#FFF4CF] px-3 py-1 text-[12px] font-medium text-primary-heading">
//               Farmer requested a change
//             </div>

//             <p className="mt-1 text-[13px] font-medium text-description-text">
//               Farmer comment
//             </p>

//             <p className="mt-1 text-[15px] font-medium text-primary-heading">
//               {requestChangeMessage}
//             </p>
//           </div>
//         )}

//         {!hasContext && (
//           <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
//             <p className="text-[15px] font-medium text-amber-700">
//               Open this page from a chat using the “Create Contract” button so
//               the contract can be linked to the farmer and post.
//             </p>
//           </div>
//         )}

//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="grid gap-6 lg:grid-cols-[1fr_380px]"
//         >
//           {/* LEFT */}
//           <section className="rounded-3xl border border-gray-100 bg-white p-8">
//             {/* Parties */}
//             <SectionLabel icon={UserGroupIcon} title="Parties" />

//             <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
//               <ReadOnlyField label="Buyer / Government Name" value={buyerName} />
//               <ReadOnlyField label="Farmer Name" value={farmerName} />
//               <ReadOnlyField label="Crop Name" value={cropName} />
//               <ReadOnlyField label="Crop Type" value={cropType} />
//             </div>

//             {/* Crop & Pricing */}
//             <div className="mt-10 border-t border-gray-100 pt-8">
//               <SectionLabel icon={ScaleIcon} title="Crop & Pricing" />

//               <div className="grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-[1.4fr_170px_1.4fr_170px]">
//                 <Controller
//                   control={control}
//                   name="totalQuantity"
//                   render={({ field, fieldState }) => (
//                     <NumberField
//                       label="Total Quantity"
//                       placeholder="Total QTY"
//                       value={String(field.value ?? "")}
//                       onChange={field.onChange}
//                       error={fieldState.error?.message}
//                     />
//                   )}
//                 />

//                 <Controller
//                   control={control}
//                   name="unitType"
//                   render={({ field }) => (
//                     <UnitToggle value={field.value} onChange={field.onChange} />
//                   )}
//                 />

//                 <Controller
//                   control={control}
//                   name="pricePerUnit"
//                   render={({ field, fieldState }) => (
//                     <NumberField
//                       label={`Price Per Unit (per ${unitType})`}
//                       placeholder={
//                         currency === "KHR"
//                           ? "Min 100, steps of 100"
//                           : `Price per ${unitType}`
//                       }
//                       value={String(field.value ?? "")}
//                       onChange={field.onChange}
//                       allowDecimal={currency === "USD"}
//                       error={fieldState.error?.message}
//                     />
//                   )}
//                 />

//                 <Controller
//                   control={control}
//                   name="currency"
//                   render={({ field }) => (
//                     <CurrencyToggle
//                       value={field.value}
//                       onChange={field.onChange}
//                     />
//                   )}
//                 />
//               </div>
//             </div>

//             {/* Payment */}
//             <div className="mt-10 border-t border-gray-100 pt-8">
//               <SectionLabel icon={BanknotesIcon} title="Payment" />

//               <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
//                 <Controller
//                   control={control}
//                   name="depositAmount"
//                   render={({ field, fieldState }) => (
//                     <NumberField
//                       label="Deposit Amount"
//                       placeholder={
//                         currency === "KHR"
//                           ? "Min 100, steps of 100"
//                           : "Deposit amount"
//                       }
//                       value={String(field.value ?? "")}
//                       onChange={field.onChange}
//                       allowDecimal={currency === "USD"}
//                       error={fieldState.error?.message}
//                     />
//                   )}
//                 />
//               </div>

//               <p className="mt-3 text-[14px] font-medium text-description-text">
//                 Total Price and Remaining Balance are calculated automatically —
//                 see the Contract Review summary.
//               </p>
//             </div>

//             {/* Schedule */}
//             <div className="mt-10 border-t border-gray-100 pt-8">
//               <SectionLabel icon={CalendarDaysIcon} title="Schedule" />

//               <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
//                 <Controller
//                   control={control}
//                   name="startDate"
//                   render={({ field, fieldState }) => (
//                     <DateField
//                       label="Start Date"
//                       value={field.value ?? ""}
//                       onChange={field.onChange}
//                       min={today}
//                       error={fieldState.error?.message}
//                     />
//                   )}
//                 />

//                 <Controller
//                   control={control}
//                   name="deliveryDate"
//                   render={({ field, fieldState }) => (
//                     <DateField
//                       label="Delivery Date"
//                       value={field.value ?? ""}
//                       onChange={field.onChange}
//                       min={startDate || today}
//                       error={fieldState.error?.message}
//                     />
//                   )}
//                 />

//                 <Controller
//                   control={control}
//                   name="endDate"
//                   render={({ field, fieldState }) => (
//                     <DateField
//                       label="End Date"
//                       value={field.value ?? ""}
//                       onChange={field.onChange}
//                       min={deliveryDate || startDate || today}
//                       error={fieldState.error?.message}
//                     />
//                   )}
//                 />
//               </div>
//             </div>

//             {/* Terms & Conditions — red link opens the details modal. */}
//             <div className="mt-10 border-t border-gray-100 pt-8">
//               <button
//                 type="button"
//                 onClick={() => setTermsOpen(true)}
//                 className="text-[18px] font-semibold text-red-600 underline underline-offset-4 transition hover:text-red-700"
//               >
//                 Terms &amp; Conditions
//               </button>

//               <p className="mt-2 text-[14px] font-medium text-description-text">
//                 Click to read the full terms and conditions of this contract.
//               </p>
//             </div>
//           </section>

//           {/* RIGHT */}
//           <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-8">
//             <h3 className="text-[28px] font-bold text-primary-heading">
//               Contract Review
//             </h3>

//             <p className="mt-3 text-[16px] leading-[1.9] text-description-text">
//               This summary helps the buyer review and confirm all contract
//               details before sending the agreement to the farmer.
//             </p>

//             {/* Highlighted total */}
//             <div className="mt-7 rounded-2xl bg-primary/5 p-6">
//               <p className="text-[13px] font-bold uppercase tracking-wider text-primary">
//                 Total Price
//               </p>
//               <p className="mt-1 text-[34px] font-black leading-tight text-primary">
//                 {formatMoney(totalPrice)}
//               </p>
//             </div>

//             <div className="mt-6 space-y-5 rounded-2xl bg-[#FAFAF7] p-6">
//               <ReviewItem label="Buyer" value={buyerName} />
//               <ReviewItem label="Farmer" value={farmerName} />
//               <ReviewItem label="Crop" value={cropName} />
//               <ReviewItem
//                 label="Quantity"
//                 value={
//                   quantityNumber > 0
//                     ? `${quantityNumber.toLocaleString("en-US")} ${unitType}`
//                     : "—"
//                 }
//               />
//               <ReviewItem
//                 label={`Price / ${unitType}`}
//                 value={priceNumber > 0 ? formatMoney(priceNumber) : "—"}
//               />
//               <ReviewItem label="Deposit" value={formatMoney(depositNumber)} />
//               <ReviewItem
//                 label="Remaining Balance"
//                 value={formatMoney(remaining)}
//                 last
//               />
//             </div>

//             {/* Agree */}
//             {errors.agreed && (
//               <p className="mt-7 mb-1 text-[14px] font-medium text-red-600">
//                 {errors.agreed.message}
//               </p>
//             )}

//             <label
//               className={`flex gap-4 rounded-2xl bg-[#FFF4CF] p-5 text-[16px] font-bold leading-relaxed text-primary-heading ${
//                 errors.agreed ? "" : "mt-7"
//               }`}
//             >
//               <input
//                 type="checkbox"
//                 {...register("agreed")}
//                 className="mt-1 h-6 w-6 accent-primary"
//               />

//               <span>I agree to the above terms and conditions.</span>
//             </label>

//             {/* Buttons */}
//             <div className="mt-7 space-y-4">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`h-[60px] w-full rounded-2xl text-[16px] font-bold transition ${
//                   isSubmitting
//                     ? "cursor-not-allowed bg-light-grey text-secondary-body"
//                     : "bg-primary text-white hover:opacity-90 active:scale-[0.99]"
//                 }`}
//               >
//                 {isSubmitting
//                   ? "Sending…"
//                   : isEditMode
//                     ? "Save & Resend to Farmer"
//                     : "Agree & Send to Farmer"}
//               </button>

//               <button
//                 type="button"
//                 onClick={() =>
//                   router.push(
//                     chatRoomId ? `/chat?chatRoomId=${chatRoomId}` : "/chat"
//                   )
//                 }
//                 className="h-[60px] w-full rounded-2xl border border-gray-200 text-[16px] font-bold text-primary-heading transition hover:border-gray-300 hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//             </div>
//           </aside>
//         </form>
//       </div>

//       <TermsConditionPopup
//         open={termsOpen}
//         onClose={() => setTermsOpen(false)}
//       />
//     </main>
//   );
// }

// function SectionLabel({
//   icon: Icon,
//   title,
// }: {
//   icon: React.ComponentType<{ className?: string }>;
//   title: string;
// }) {
//   return (
//     <div className="mb-6 flex items-center gap-2.5">
//       <Icon className="h-5 w-5 text-primary" />
//       <h2 className="text-[13px] font-bold uppercase tracking-wider text-primary">
//         {title}
//       </h2>
//     </div>
//   );
// }

// function ReadOnlyField({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <label className="mb-2 block text-[18px] font-medium text-primary">
//         {label}
//       </label>

//       <input
//         type="text"
//         value={value}
//         readOnly
//         className="h-13 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 text-[18px] font-semibold text-primary-heading outline-none"
//       />
//     </div>
//   );
// }

// function NumberField({
//   label,
//   value,
//   placeholder,
//   onChange,
//   error,
//   allowDecimal = true,
// }: {
//   label: string;
//   value: string;
//   placeholder?: string;
//   onChange: (value: string) => void;
//   error?: string;
//   allowDecimal?: boolean;
// }) {
//   // Digits only; allow a single decimal point unless the field is integer-only
//   // (e.g. KHR amounts). Any other symbol — "-", "$", letters — is rejected.
//   const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;

//   return (
//     <div>
//       <label className="mb-2 block text-[18px] font-medium text-primary">
//         <span className="text-red-500">*</span> {label}
//       </label>

//       {error && (
//         <p className="mb-1 text-[14px] font-medium text-red-600">{error}</p>
//       )}

//       <input
//         type="text"
//         inputMode={allowDecimal ? "decimal" : "numeric"}
//         value={value}
//         placeholder={placeholder}
//         onChange={(event) => {
//           const next = event.target.value;
//           // Keep exactly what is typed as long as it matches the number shape.
//           if (next === "" || pattern.test(next)) {
//             onChange(next);
//           }
//         }}
//         className={`h-13 w-full rounded-xl border bg-white px-4 text-[18px] font-semibold text-primary-heading outline-none transition-colors placeholder:font-medium placeholder:text-gray-400 focus:ring-2 ${
//           error
//             ? "border-red-400 focus:border-red-400 focus:ring-red-100"
//             : "border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-primary/15"
//         }`}
//       />
//     </div>
//   );
// }

// function DateField({
//   label,
//   value,
//   onChange,
//   min,
//   error,
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   min?: string;
//   error?: string;
// }) {
//   return (
//     <div>
//       <label className="mb-2 block text-[18px] font-medium text-primary">
//         <span className="text-red-500">*</span> {label}
//       </label>

//       {error && (
//         <p className="mb-1 text-[14px] font-medium text-red-600">{error}</p>
//       )}

//       <input
//         type="date"
//         value={value}
//         min={min}
//         onChange={(event) => onChange(event.target.value)}
//         className={`h-13 w-full rounded-xl border bg-white px-4 text-[18px] font-semibold text-primary-heading outline-none transition-colors focus:ring-2 ${
//           error
//             ? "border-red-400 focus:border-red-400 focus:ring-red-100"
//             : "border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-primary/15"
//         }`}
//       />
//     </div>
//   );
// }

// function ReviewItem({
//   label,
//   value,
//   last = false,
// }: {
//   label: string;
//   value: string;
//   last?: boolean;
// }) {
//   return (
//     <div
//       className={`flex items-center justify-between ${
//         last ? "" : "border-b border-light-grey pb-3"
//       }`}
//     >
//       <span className="text-[16px] text-description-text">{label}</span>
//       <span className="text-[16px] font-medium text-primary-heading">
//         {value}
//       </span>
//     </div>
//   );
// }



"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { UnitToggle } from "./UnitToggle";
import { CurrencyToggle } from "./CurrencyToggle";
import TermsConditionPopup from "./TermsConditionPopup";
import {
  createContractService,
  updateContractService,
} from "@/action/contract.action";
import { showApiToast } from "@/lib/apiToast";
import {
  contractSchema,
  type ContractFormInput,
  type ContractFormValues,
} from "@/schema/contract.schema";
import { DatePickerComponent } from "@/components/ui/DatePickerComponent";
import { MarketPriceWarning } from "@/components/common/MarketPriceWarning";
import { useMarketPriceCheck } from "@/hooks/useMarketPriceCheck";
import { KHR_PER_USD } from "@/utils/currency";
import {
  convertMarketCurrencyAmount,
  convertMarketPricePerUnit,
  convertMarketQuantity,
  roundMarketCurrency,
  roundMarketQuantity,
  type MarketCurrency,
  type MarketUnit,
} from "@/utils/unitCurrencyConversion";

// String-shaped values used to prefill the form in edit mode.
type ContractInitial = {
  unitType: "KG" | "TON";
  currency: "KHR" | "USD";
  totalQuantity: string;
  pricePerUnit: string;
  depositAmount: string;
  deliveryDate: string;
  startDate: string;
  endDate: string;
  durationDays?: string;
};

type Props = {
  contractId?: string;
  chatRoomId?: string;
  postId?: string;
  farmerId?: string;
  buyerName?: string;
  farmerName?: string;
  cropName?: string;
  cropType?: string;
  unitType?: "KG" | "TON";
  requestChangeMessage?: string | null;
  initial?: ContractInitial;
  demandQuantityNeeded?: number | null;
  demandUnitType?: "KG" | "TON" | null;
  // Crop-demand create flow: convenience defaults pulled from the demand post,
  // plus a price cap (the buyer's stated maximum, in `capCurrency`).
  prefill?: Partial<ContractInitial>;
};

// Terms accordion items — labels only; full text lives in TermsConditionPopup.
const TERMS_ITEMS = [
  {
    label: "Delivery Condition",
    detail:
      "The farmer must prepare and deliver the crop according to the agreed delivery date, quantity, and location. If delivery may be delayed because of weather, transport, or stock issues, the farmer should inform the buyer as early as possible through chat.",
  },
  {
    label: "Quality Standard",
    detail:
      "The crop should match the agreed crop type, unit, quantity, and expected market quality. The farmer should not mix damaged, spoiled, or unrelated produce with the agreed crop. The buyer should inspect the crop fairly based on the contract terms.",
  },
  {
    label: "Payment Condition",
    detail:
      "The buyer must pay the agreed deposit before the order proceeds. The remaining balance should be paid after the agreed delivery or confirmation stage. Both parties should keep payment proof, transaction references, and chat records until the trade is completed.",
  },
  {
    label: "Cancellation Policy",
    detail:
      "Either party may request cancellation before major preparation, payment, or delivery work has started. If cancellation happens after one party has already spent time, money, or transport cost, both parties should discuss a fair solution before closing the trade.",
  },
  {
    label: "Penalty / Compensation",
    detail:
      "If one party fails to follow the agreed terms without a valid reason, the affected party may request fair compensation. Compensation should be based on actual loss, such as transport cost, rejected crop quantity, late delivery impact, or payment delay.",
  },
  {
    label: "Dispute Handling",
    detail:
      "If a problem happens, both parties should first discuss it politely in chat and share clear evidence such as photos, receipts, delivery records, and payment proof. If they cannot agree, the saved contract and chat history can be used for further review.",
  },
];

const DEFAULT_CONTRACT_DURATION_DAYS = 30;

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDaysInputValue(startDate: string, days: number) {
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  return toDateInputValue(date);
}

function formatContractPeriodDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    !year ||
    !month ||
    !day ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return value;
  }

  const dayLabel = String(day).padStart(2, "0");
  const monthLabel = date.toLocaleDateString("en-US", { month: "short" });

  return `${dayLabel} ${monthLabel}, ${year}`;
}

function formatContractPeriod(startDate: string, endDate: string) {
  return `${formatContractPeriodDate(startDate)} - ${formatContractPeriodDate(endDate)}`;
}

function getDurationDays(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return DEFAULT_CONTRACT_DURATION_DAYS;

  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  const diffDays = Math.round((end - start) / 86_400_000);

  return Number.isFinite(diffDays) && diffDays > 0
    ? diffDays
    : DEFAULT_CONTRACT_DURATION_DAYS;
}

function numberFromField(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

function formatQuantityField(value: number) {
  return String(roundMarketQuantity(value));
}

function formatMoneyField(value: number, currencyCode: MarketCurrency) {
  const rounded =
    currencyCode === "KHR"
      ? Math.round(roundMarketCurrency(value, currencyCode) / 100) * 100
      : roundMarketCurrency(value, currencyCode);

  return String(rounded);
}

function buildContractRequestMessage({
  contractId,
  cropName,
  farmerName,
}: {
  contractId: string;
  cropName: string;
  farmerName: string;
}) {
  return [
    `CONTRACT_REQUEST:${contractId}`,
    `crop:${cropName.replace(/\s+/g, " ").trim() || "Crop Demand"}`,
    `farmer:${farmerName.replace(/\s+/g, " ").trim() || "Farmer"}`,
  ].join("\n");
}

export default function CreateContract({
  contractId,
  chatRoomId,
  postId,
  farmerId,
  buyerName = "Buyer",
  farmerName = "Farmer",
  cropName = "—",
  cropType = "—",
  unitType: initialUnitType = "KG",
  requestChangeMessage,
  initial,
  demandQuantityNeeded,
  demandUnitType,
  prefill,
}: Props) {
  const router = useRouter();

  const isEditMode = Boolean(contractId);

  const [openTermIndex, setOpenTermIndex] = useState<number | null>(0);

  // Contract creation day — the earliest allowed start date. Use the local
  // calendar date (not UTC) so it doesn't show "yesterday" in +07:00 mornings.
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const defaultDurationDays = getDurationDays(
    initial?.startDate ?? prefill?.startDate ?? today,
    initial?.endDate ?? prefill?.endDate,
  );
  const defaultStartDate = isEditMode
    ? initial?.startDate ?? prefill?.startDate ?? today
    : today;
  const defaultEndDate = addDaysInputValue(defaultStartDate, defaultDurationDays);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    trigger,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormInput, object, ContractFormValues>({
    resolver: zodResolver(contractSchema),
    mode: "onChange",
    defaultValues: {
      unitType: initial?.unitType ?? prefill?.unitType ?? initialUnitType,
      // Default to the contract being edited, then the farmer offer / demand
      // (via prefill), then USD. The backend persists the chosen currency.
      currency: initial?.currency ?? prefill?.currency ?? "USD",
      totalQuantity: initial?.totalQuantity ?? prefill?.totalQuantity ?? "",
      pricePerUnit: initial?.pricePerUnit ?? prefill?.pricePerUnit ?? "",
      depositAmount: initial?.depositAmount ?? prefill?.depositAmount ?? "",
      deliveryDate: initial?.deliveryDate ?? prefill?.deliveryDate ?? "",
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      durationDays: initial?.durationDays ?? prefill?.durationDays ?? String(defaultDurationDays),
      agreed: false,
    },
  });

  const hasContext = isEditMode
    ? Boolean(contractId)
    : Boolean(chatRoomId && postId && farmerId);
  const draftKey = useMemo(() => {
    if (isEditMode || !chatRoomId || !postId || !farmerId) return null;

    return `contract_draft:${chatRoomId}:${postId}:${farmerId}`;
  }, [chatRoomId, farmerId, isEditMode, postId]);

  // Live values for the running totals and unit/currency labels.
  const unitType = useWatch({ control, name: "unitType" });
  const currency = useWatch({ control, name: "currency" });
  const totalQuantity = useWatch({ control, name: "totalQuantity" });
  const pricePerUnit = useWatch({ control, name: "pricePerUnit" });
  const depositAmount = useWatch({ control, name: "depositAmount" });
  const startDate = useWatch({ control, name: "startDate" });
  const durationDays = useWatch({ control, name: "durationDays" });

  const currencySymbol = currency === "USD" ? "$" : "៛";

  const quantityNumber = Number(totalQuantity) || 0;
  const priceNumber = Number(pricePerUnit) || 0;
  const depositNumber = Number(depositAmount) || 0;
  const marketPriceCheck = useMarketPriceCheck({
    context: "CROP_DEMAND_CONTRACT",
    postId,
    unitType,
    currencyCode: currency,
    pricePerUnit: priceNumber,
    enabled: Boolean(postId),
  });

  const totalPrice = quantityNumber * priceNumber;
  const remaining = Math.max(0, totalPrice - depositNumber);
  const durationNumber = Number(durationDays) || DEFAULT_CONTRACT_DURATION_DAYS;
  const computedStartDate = isEditMode ? startDate || defaultStartDate : today;
  const computedEndDate = addDaysInputValue(computedStartDate, durationNumber);
  const contractPeriodLabel = formatContractPeriod(computedStartDate, computedEndDate);

  useEffect(() => {
    setValue("startDate", computedStartDate, { shouldValidate: true });
    setValue("endDate", computedEndDate, { shouldValidate: true });
    void trigger(["durationDays", "endDate", "deliveryDate"]);
  }, [computedEndDate, computedStartDate, setValue, trigger]);

  useEffect(() => {
    if (!draftKey) return;

    const rawDraft = window.localStorage.getItem(draftKey);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as Partial<ContractFormValues>;
      reset({
        ...getValues(),
        ...draft,
        agreed: false,
      });

      showApiToast(
        { success: true },
        {
          successTitle: "Draft restored",
          successMessage: "Your saved contract draft has been loaded.",
          errorTitle: "Draft unavailable",
        },
      );
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, [draftKey, getValues, reset]);

  const formatMoney = (value: number) =>
    `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${currencySymbol}`;

  const getDemandQuantityError = useCallback((
    quantity: number,
    selectedUnit: MarketUnit,
  ) => {
    if (
      demandQuantityNeeded == null ||
      demandUnitType == null ||
      !Number.isFinite(demandQuantityNeeded) ||
      demandQuantityNeeded <= 0 ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return null;
    }

    const quantityInDemandUnit = convertMarketQuantity(
      quantity,
      selectedUnit,
      demandUnitType,
    );

    if (quantityInDemandUnit <= demandQuantityNeeded) {
      return null;
    }

    const remainingInSelectedUnit = convertMarketQuantity(
      demandQuantityNeeded,
      demandUnitType,
      selectedUnit,
    );

    return `Quantity cannot exceed remaining demand: ${roundMarketQuantity(
      remainingInSelectedUnit,
    ).toLocaleString("en-US")} ${selectedUnit}.`;
  }, [demandQuantityNeeded, demandUnitType]);

  useEffect(() => {
    const quantityError = getDemandQuantityError(quantityNumber, unitType);

    if (quantityError) {
      setError("totalQuantity", {
        type: "validate",
        message: quantityError,
      });
      return;
    }

    if (errors.totalQuantity?.type === "validate") {
      clearErrors("totalQuantity");
    }
  }, [
    clearErrors,
    demandQuantityNeeded,
    demandUnitType,
    errors.totalQuantity?.type,
    getDemandQuantityError,
    quantityNumber,
    setError,
    unitType,
  ]);

  const handleUnitChange = (nextUnit: MarketUnit) => {
    const currentUnit = getValues("unitType") as MarketUnit;
    if (nextUnit === currentUnit) return;

    const currentQuantity = numberFromField(getValues("totalQuantity"));
    const currentPrice = numberFromField(getValues("pricePerUnit"));

    setValue("unitType", nextUnit, { shouldDirty: true, shouldValidate: true });

    if (currentQuantity != null) {
      setValue(
        "totalQuantity",
        formatQuantityField(convertMarketQuantity(currentQuantity, currentUnit, nextUnit)),
        { shouldDirty: true, shouldValidate: true },
      );
    }

    if (currentPrice != null) {
      setValue(
        "pricePerUnit",
        formatMoneyField(
          convertMarketPricePerUnit(currentPrice, currentUnit, nextUnit),
          getValues("currency") as MarketCurrency,
        ),
        { shouldDirty: true, shouldValidate: true },
      );
    }
  };

  const handleCurrencyChange = (nextCurrency: MarketCurrency) => {
    const currentCurrency = getValues("currency") as MarketCurrency;
    if (nextCurrency === currentCurrency) return;

    const currentPrice = numberFromField(getValues("pricePerUnit"));
    const currentDeposit = numberFromField(getValues("depositAmount"));

    setValue("currency", nextCurrency, { shouldDirty: true, shouldValidate: true });

    if (currentPrice != null) {
      setValue(
        "pricePerUnit",
        formatMoneyField(
          convertMarketCurrencyAmount(
            currentPrice,
            currentCurrency,
            nextCurrency,
            KHR_PER_USD,
          ),
          nextCurrency,
        ),
        { shouldDirty: true, shouldValidate: true },
      );
    }

    if (currentDeposit != null) {
      setValue(
        "depositAmount",
        formatMoneyField(
          convertMarketCurrencyAmount(
            currentDeposit,
            currentCurrency,
            nextCurrency,
            KHR_PER_USD,
          ),
          nextCurrency,
        ),
        { shouldDirty: true, shouldValidate: true },
      );
    }
  };

  const handleSaveDraft = () => {
    if (!draftKey) {
      showApiToast(
        { success: false },
        {
          successTitle: "Draft saved",
          errorTitle: "Cannot save draft",
          errorMessage:
            "Open this page from a chat before saving a contract draft.",
        },
      );
      return;
    }

    window.localStorage.setItem(
      draftKey,
      JSON.stringify({
        ...getValues(),
        startDate: computedStartDate,
        endDate: computedEndDate,
        agreed: false,
      }),
    );

    showApiToast(
      { success: true },
      {
        successTitle: "Draft saved",
        successMessage:
          "Open Create Contract from this same chat to continue editing it.",
        errorTitle: "Draft unavailable",
      },
    );

    router.push(chatRoomId ? `/chat?chatRoomId=${chatRoomId}` : "/chat");
  };

  const onSubmit = async (values: ContractFormValues) => {
    if (!hasContext) {
      showApiToast(
        { success: false },
        {
          successTitle: "Contract created",
          errorTitle: "Missing chat context",
          errorMessage:
            "Open this page from a chat's &quot; Create Contract &quot;button to send a contract.",
        }
      );
      return;
    }

    const quantityError = getDemandQuantityError(
      values.totalQuantity,
      values.unitType,
    );

    if (quantityError) {
      setError("totalQuantity", {
        type: "validate",
        message: quantityError,
      });
      return;
    }

    void marketPriceCheck.checkNow();

    const termValues = {
      unitType: values.unitType,
      currencyCode: values.currency,
      pricePerUnit: values.pricePerUnit,
      totalQuantity: values.totalQuantity,
      depositAmount: values.depositAmount,
      deliveryDate: new Date(values.deliveryDate).toISOString(),
      startDate: new Date(computedStartDate).toISOString(),
      endDate: new Date(computedEndDate).toISOString(),
    };

    const result = isEditMode
      ? await updateContractService(contractId!, termValues)
      : await createContractService({
          ...termValues,
          farmerId: farmerId!,
          postId: postId!,
          chatRoomId: chatRoomId!,
        });

    const ok = showApiToast(result, {
      successTitle: isEditMode ? "Contract updated" : "Contract sent",
      successMessage: isEditMode
        ? "Your changes were sent to the farmer for review."
        : "Your contract was sent to the farmer for review.",
      errorTitle: isEditMode ? "Could not update contract" : "Could not create contract",
      errorMessage: result.message ?? "Please try again.",
    });

    if (ok) {
      const resolvedContractId = result.contractId ?? contractId;
      if (draftKey) {
        window.localStorage.removeItem(draftKey);
      }

      if (chatRoomId && resolvedContractId) {
        sessionStorage.setItem(
          `pending_contract_message:${chatRoomId}`,
          buildContractRequestMessage({
            contractId: resolvedContractId,
            cropName,
            farmerName,
          }),
        );
      }

      const chatParams = new URLSearchParams();
      if (chatRoomId) chatParams.set("chatRoomId", chatRoomId);
      if (resolvedContractId) {
        chatParams.set("contractId", resolvedContractId);
      }

      router.push(
        chatRoomId && chatParams.size > 0
          ? `/chat?${chatParams.toString()}`
          : `/digital-contract/${resolvedContractId}`
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf6e9] py-8">
      {/* Page heading — outside the card, full width to match the breadcrumb */}
      <div className="w-full">
        <h1 className="text-[26px] font-black text-primary-heading">
          {isEditMode ? "Edit Digital Contract" : "Create Digital Contracts"}
        </h1>
        <p className="mt-1 text-[15px] text-description-text">
          {isEditMode
            ? "Update the terms and resend the contract to the farmer for review."
            : "Expand your Cambodian produce to the digital marketplace."}
        </p>

        {/* Edit-mode: farmer's change request banner */}
        {isEditMode && requestChangeMessage && (
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-2 inline-flex rounded-full bg-[#FFF4CF] px-3 py-1 text-[12px] font-medium text-primary-heading">
              Farmer requested a change
            </div>
            <p className="mt-1 text-[13px] font-medium text-description-text">
              Farmer comment
            </p>
            <p className="mt-1 text-[15px] font-medium text-primary-heading">
              {requestChangeMessage}
            </p>
          </div>
        )}

        {/* Missing chat context warning */}
        {!hasContext && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-[15px] font-medium text-amber-700">
              Open this page from a chat using the &quot;Create Contract&quot; button so
              the contract can be linked to the farmer and post.
            </p>
          </div>
        )}

        {/* ── Main form card ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">

            {/* ── Basic Information ── */}
            <h2 className="mb-5 text-[17px] font-bold text-primary-heading">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Buyer / Government Name" required error={undefined}>
                <ReadOnlyInput value={buyerName} />
              </FormField>

              <FormField label="Farmer Name" required error={undefined}>
                <ReadOnlyInput value={farmerName} />
              </FormField>

              <FormField label="Crop Name" required error={undefined}>
                <ReadOnlyInput value={cropName} />
              </FormField>

              {/* Crop Type — rendered as a read-only styled select to match screenshot */}
              <FormField label="Crop Type" required error={undefined}>
                <div className="relative">
                  <input
                    type="text"
                    value={cropType === "—" ? "" : cropType}
                    readOnly
                    placeholder="Select"
                    className="h-12 w-full cursor-default rounded-xl border border-gray-200 bg-white px-4 pr-10 text-[15px] font-medium text-primary-heading placeholder:text-gray-400 outline-none"
                  />
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </FormField>
            </div>

            {/* ── Quantity / Unit / Price / Currency row ── */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[1fr_150px_1fr_150px]">
              <Controller
                control={control}
                name="totalQuantity"
                render={({ field, fieldState }) => (
                  <FormField label="Total Quantity" required error={fieldState.error?.message}>
                    <NumberInput
                      value={String(field.value ?? "")}
                      placeholder="Total QTY"
                      onChange={field.onChange}
                      allowDecimal
                      hasError={Boolean(fieldState.error)}
                    />
                  </FormField>
                )}
              /> 

              <Controller
                control={control}
                name="unitType"
                render={({ field }) => (
                  <FormField label="Unit Type" required error={undefined}>
                    <UnitToggle value={field.value} onChange={handleUnitChange} />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="pricePerUnit"
                render={({ field, fieldState }) => (
                  <FormField label="Price Per Unit" required error={fieldState.error?.message}>
                    <>
                      <NumberInput
                        value={String(field.value ?? "")}
                        placeholder={currency === "KHR" ? "Min 100, steps of 100" : `Price per ${unitType}`}
                        onChange={field.onChange}
                        allowDecimal={currency === "USD"}
                        hasError={Boolean(fieldState.error)}
                      />
                      <MarketPriceWarning
                        check={marketPriceCheck.data}
                        error={marketPriceCheck.error}
                        isChecking={marketPriceCheck.isChecking}
                        unitType={unitType}
                      />
                    </>
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <FormField label="Currency" required error={undefined}>
                    <CurrencyToggle value={field.value} onChange={handleCurrencyChange} />
                  </FormField>
                )}
              />
            </div>

            {/* ── Total Price / Delivery Date row ── */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Total Price" required error={undefined}>
                <ReadOnlyInput value={totalPrice > 0 ? formatMoney(totalPrice) : ""} placeholder="—" />
              </FormField>

              <Controller
                control={control}
                name="deliveryDate"
                render={({ field, fieldState }) => (
                  <FormField label="Delivery Date" required error={fieldState.error?.message}>
                    <DateInput
                      id="contract-delivery-date"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      min={startDate || today}
                      hasError={Boolean(fieldState.error)}
                    />
                  </FormField>
                )}
              />
            </div>

            {/* ── Remaining Balance / Deposit row ── */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Remaining balance" required error={undefined}>
                <ReadOnlyInput value={remaining > 0 ? formatMoney(remaining) : ""} placeholder="—" />
              </FormField>

              {/* Deposit is an actual money amount (not a percentage): KHR ≥ 100
                  in steps of 100, USD ≥ 0.01, and never more than the total. */}
              <Controller
                control={control}
                name="depositAmount"
                render={({ field, fieldState }) => (
                  <FormField label="Deposit Amount" required error={fieldState.error?.message}>
                    <NumberInput
                      value={String(field.value ?? "")}
                      placeholder={currency === "KHR" ? "Min 100, steps of 100" : "Min 0.01"}
                      onChange={field.onChange}
                      allowDecimal={currency === "USD"}
                      hasError={Boolean(fieldState.error)}
                    />
                  </FormField>
                )}
              />
            </div>

            {/* ── Duration of contract (maps to endDate, displayed as days) ── */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                control={control}
                name="durationDays"
                render={({ field, fieldState }) => (
                  <FormField label="Duration of contract" required error={fieldState.error?.message}>
                    {/*
                      The screenshot shows a plain text input like "30 Day".
                      We keep the endDate date picker as the source of truth and
                      derive a human-readable duration label. A date picker is
                      still rendered so validation works — hidden visually when
                      you want the "30 Day" UX. Here we show the date picker
                      to keep editing possible, matching the existing logic.
                    */}
                    <NumberInput
                      value={String(field.value ?? "")}
                      placeholder="30"
                      onChange={field.onChange}
                      allowDecimal={false}
                      hasError={Boolean(fieldState.error)}
                    />
                  </FormField>
                )}
              />

              <FormField label="Contract period" required error={undefined}>
                <ReadOnlyInput value={contractPeriodLabel} />
              </FormField>
            </div>

            {/* ── Terms & Conditions accordion ── */}
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-[16px] font-bold text-primary-heading">
                  Terms &amp; Conditions
                </h3>
              </div>

              {TERMS_ITEMS.map((item, idx) => {
                const isOpen = openTermIndex === idx;
                return (
                  <div key={item.label} className="border-b border-gray-100 last:border-0">
                    <button
                      type="button"
                      onClick={() => setOpenTermIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left"
                    >
                      <span className="text-[15px] font-medium text-primary-heading">
                        {item.label}
                      </span>
                      <ChevronDownIcon
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && item.detail && (
                      <div className="px-6 pb-4">
                        <p className="text-[14px] text-green-600">{item.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom action bar ── */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 md:flex-row md:items-center md:justify-between">

            {/* Agree checkbox — styled yellow pill like screenshot */}
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-5 py-3 text-[13px] font-bold uppercase tracking-wide text-primary-heading transition ${
                errors.agreed ? "bg-amber-100" : "bg-[#FFF4CF]"
              }`}
            >
              <input
                type="checkbox"
                {...register("agreed")}
                className="h-5 w-5 accent-primary"
              />
              I agree to the above terms of conditions.
            </label>

            {errors.agreed && (
              <p className="text-[13px] font-medium text-red-600">
                {errors.agreed.message}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <button
                type="button"
                onClick={() =>
                  router.push(chatRoomId ? `/chat?chatRoomId=${chatRoomId}` : "/chat")
                }
                className="h-11 rounded-xl border border-gray-300 px-7 text-[14px] font-bold text-primary-heading transition hover:bg-gray-50"
              >
                Cancel
              </button>

              {/* Save Draft — only shown in create mode, not in the schema but shown in screenshot */}
              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="h-11 rounded-xl border border-gray-300 px-7 text-[14px] font-bold text-primary-heading transition hover:bg-gray-50"
                >
                  Save Draft
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`h-11 rounded-xl px-7 text-[14px] font-bold transition ${
                  isSubmitting
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : "bg-primary text-white hover:opacity-90 active:scale-[0.99]"
                }`}
              >
                {isSubmitting
                  ? "Sending…"
                  : isEditMode
                    ? "Save & Resend to Farmer"
                    : "Agree & Send to Farmer"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <TermsConditionPopup
        open={false}
        onClose={() => {}}
      />
    </main>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[14px] font-semibold text-primary">
        {required && <span className="mr-0.5 text-red-500">*</span>}
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[13px] font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

function ReadOnlyInput({
  value,
  placeholder = "",
}: {
  value: string;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      readOnly
      placeholder={placeholder}
      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] font-medium text-primary-heading placeholder:text-gray-400 outline-none"
    />
  );
}

function NumberInput({
  value,
  placeholder,
  onChange,
  allowDecimal = true,
  hasError,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
  hasError?: boolean;
}) {
  const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;

  return (
    <input
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value;
        if (next === "" || pattern.test(next)) onChange(next);
      }}
      className={`h-12 w-full rounded-xl border bg-white px-4 text-[15px] font-medium text-primary-heading placeholder:text-gray-400 outline-none transition-colors focus:ring-2 ${
        hasError
          ? "border-red-400 focus:ring-red-100"
          : "border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-primary/15"
      }`}
    />
  );
}

function DateInput({
  id,
  value,
  onChange,
  onBlur,
  min,
  hasError,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  min?: string;
  hasError?: boolean;
}) {
  return (
    <DatePickerComponent
      id={id}
      value={value}
      minDate={min}
      invalid={hasError}
      onBlur={onBlur}
      onChange={onChange}
      groupClassName={
        hasError
          ? "border-red-400 hover:border-red-400 focus-within:border-red-400 focus-within:ring-red-100"
          : "border-gray-200 hover:border-gray-300 focus-within:border-primary focus-within:ring-primary/15"
      }
      popoverClassName="w-72!"
    />
  );
}
