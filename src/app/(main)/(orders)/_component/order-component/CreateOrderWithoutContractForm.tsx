// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useMemo, useState, useTransition } from "react";
// import { CalendarDays, ChevronRight } from "lucide-react";
// import {
//   createCropProductOrderAction,
//   startCropProductChatAction,
// } from "@/action/crop-product-order.action";
// import { showApiError, showApiSuccess } from "@/lib/apiToast";

// const UNIT_OPTIONS = ["KG", "TON"] as const;
// const CURRENCY_OPTIONS = ["KHR", "USD"] as const;

// type Props = {
//   postId: string;
//   chatRoomId: string;
//   farmerId: string;
//   buyerName: string;
//   pricePerUnit?: number;
//   stockLeft?: number;
//   unitType?: string;
//   currencyCode?: string;
//   cropName?: string;
//   cropType?: string;
//   title?: string;
//   farmerName?: string;
//   imageUrls?: string[];
// };

// export default function CreateOrderWithoutContractForm({
//   postId,
//   chatRoomId,
//   farmerId,
//   buyerName,
//   pricePerUnit = 0,
//   stockLeft = 0,
//   unitType = "KG",
//   currencyCode = "KHR",
//   cropName,
//   cropType = "Crop",
//   title,
//   farmerName = "Farmer",
// }: Props) {
//   const router = useRouter();
//   const [quantity, setQuantity] = useState<number | "">(1);
//   const [selectedUnit, setSelectedUnit] = useState(unitType);
//   const [selectedCurrency, setSelectedCurrency] = useState(currencyCode);
//   const [isPending, startTransition] = useTransition();

//   const safeStockLeft = Math.max(0, stockLeft);
//   const displayName = cropName || title || "Crop Product";
//   const numQty = typeof quantity === "number" ? quantity : 0;
//   const deliveryDate = new Intl.DateTimeFormat("en-GB", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(new Date());

//   const totalAmount = useMemo(
//     () => numQty * pricePerUnit,
//     [pricePerUnit, numQty],
//   );

//   const formatAmount = (amount: number) =>
//     new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: selectedCurrency || "USD",
//       minimumFractionDigits: selectedCurrency === "KHR" ? 0 : 2,
//     }).format(amount);

//   function handleSubmit(event: { preventDefault(): void }) {
//     event.preventDefault();

//     if (!numQty || numQty <= 0) {
//       showApiError(new Error("Quantity must be greater than 0."));
//       return;
//     }
//     if (numQty > safeStockLeft) {
//       showApiError(new Error(`Only ${safeStockLeft} ${selectedUnit} available.`));
//       return;
//     }

//     startTransition(async () => {
//       let resolvedChatRoomId = chatRoomId;

//       if (!resolvedChatRoomId) {
//         const chatResult = await startCropProductChatAction({
//           chatType: "CROP_PRODUCT",
//           postId,
//           farmerId,
//           message: `I want to buy this product ${displayName}`,
//         });
//         if (!chatResult.success || !chatResult.chatRoomId) {
//           showApiError(new Error(chatResult.error ?? "Failed to start chat."));
//           return;
//         }
//         resolvedChatRoomId = chatResult.chatRoomId;
//       }

//       const orderResult = await createCropProductOrderAction({
//         postId,
//         chatRoomId: resolvedChatRoomId,
//         quantity: numQty,
//         depositAmount: totalAmount,
//         contractId: null,
//       });

//       if (!orderResult.success || !orderResult.data) {
//         showApiError(new Error(orderResult.error ?? "Failed to create order."));
//         return;
//       }

//       showApiSuccess("Order created", "Please complete your payment.");
//       router.push(`/payment-crop-product?orderId=${orderResult.data.orderId}`);
//     });
//   }

//   return (
//     <div className="relative min-h-[620px] overflow-hidden bg-[#FBF5E7] px-4 pb-8 pt-6 text-primary-heading sm:px-6 lg:px-8">
//       <div
//         className="pointer-events-none absolute -right-16 bottom-4 h-72 w-72 opacity-45"
//         style={{
//           backgroundImage: 'url("/image/background-footer-b.png")',
//           backgroundSize: "contain",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "right bottom",
//         }}
//       />
//       <div className="relative z-10 mx-auto w-full max-w-[1000px]">

//         {/* Breadcrumb */}
//         <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-muted">
//           <Link href="/" className="transition hover:text-primary">Home</Link>
//           <ChevronRight className="h-3 w-3 opacity-50" />
//           <Link href="/chat" className="transition hover:text-primary">Chat</Link>
//           <ChevronRight className="h-3 w-3 opacity-50" />
//           <span className="font-bold text-primary">Order</span>
//         </nav>

//         {/* Page heading */}
//         <div className="mx-auto mb-4 w-full max-w-[820px]">
//           <h1 className="text-[22px] font-extrabold leading-tight text-primary-heading">
//             Order Without Contract
//           </h1>
//           <p className="mt-1 text-[12px] font-medium text-muted">
//             Expand your Cambodian produce to the digital marketplace.
//           </p>
//         </div>

//         {/* Form card */}
//         <form
//           onSubmit={handleSubmit}
//           className="mx-auto w-full max-w-[820px] rounded-[2px] border border-[#E6E1D4] bg-white shadow-sm"
//         >
//           {/* Section heading */}
//           <div className="border-b border-[#E9E2D4] px-5 py-4">
//             <h2 className="text-[14px] font-extrabold text-primary-heading">
//               Basic Information
//             </h2>
//           </div>

//           <div className="grid grid-cols-1 gap-x-5 gap-y-3 px-5 py-4 sm:grid-cols-2">

//             {/* Buyer */}
//             <FormField label="Buyer / Government Name" required>
//               <ReadOnlyInput value={buyerName} />
//             </FormField>

//             {/* Farmer */}
//             <FormField label="Farmer Name" required>
//               <ReadOnlyInput value={farmerName} />
//             </FormField>

//             {/* Crop Name */}
//             <FormField label="Crop Name" required>
//               <ReadOnlyInput value={displayName} />
//             </FormField>

//             {/* Crop Type */}
//             <FormField label="Crop Type" required>
//               <ReadOnlyInput value={cropType || "Select"} muted={!cropType} />
//             </FormField>

//             {/* Quantity + Unit Type */}
//             <FormField label="Total Quantity" required>
//               <div className="flex gap-2">
//                 <input
//                   type="number"
//                   min={1}
//                   max={safeStockLeft}
//                   required
//                   value={quantity}
//                   onChange={(e) => {
//                     const v = e.target.value;
//                     if (v === "") { setQuantity(""); return; }
//                     const n = parseInt(v, 10);
//                     if (!isNaN(n)) setQuantity(Math.min(safeStockLeft, Math.max(1, n)));
//                   }}
//                   placeholder="0"
//                   className="h-10 min-w-0 flex-1 rounded-[6px] border border-[#D9DEE4] bg-white px-3 text-[13px] font-semibold text-primary-heading outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
//                 />
//                 {/* Unit type pill selector */}
//                 <div className="flex shrink-0 items-center gap-1 rounded-[6px] border border-[#D9DEE4] bg-white px-2">
//                   {UNIT_OPTIONS.map((u) => (
//                     <button
//                       key={u}
//                       type="button"
//                       onClick={() => setSelectedUnit(u)}
//                       className={`rounded-[4px] px-2.5 py-1 text-[11px] font-bold transition ${
//                         selectedUnit === u
//                           ? "bg-primary text-white"
//                           : "text-muted hover:text-primary-heading"
//                       }`}
//                     >
//                       {u}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <p className="mt-1 text-[10px] text-muted">
//                 Available: {safeStockLeft} {selectedUnit}
//               </p>
//             </FormField>

//             {/* Price Per Unit + Currency */}
//             <FormField label="Price Per Unit" required>
//               <div className="flex gap-2">
//                 <div className="flex h-10 min-w-0 flex-1 items-center rounded-[6px] border border-[#D9DEE4] bg-white px-3 text-[13px] font-semibold text-primary-heading">
//                   {pricePerUnit.toLocaleString()}
//                 </div>
//                 {/* Currency pill selector */}
//                 <div className="flex shrink-0 items-center gap-1 rounded-[6px] border border-[#D9DEE4] bg-white px-2">
//                   {CURRENCY_OPTIONS.map((c) => (
//                     <button
//                       key={c}
//                       type="button"
//                       onClick={() => setSelectedCurrency(c)}
//                       className={`rounded-[4px] px-2.5 py-1 text-[11px] font-bold transition ${
//                         selectedCurrency === c
//                           ? "bg-primary text-white"
//                           : "text-muted hover:text-primary-heading"
//                       }`}
//                     >
//                       {c}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </FormField>

//             {/* Total Price */}
//             <FormField label="Total Price" required>
//               <ReadOnlyInput value={formatAmount(totalAmount)} highlight />
//             </FormField>

//             <FormField label="Delivery Date" required>
//               <ReadOnlyInput
//                 value={deliveryDate}
//                 icon={<CalendarDays className="h-3.5 w-3.5 text-muted" />}
//               />
//             </FormField>

//           </div>

//           {/* Action buttons */}
//           <div className="flex flex-col-reverse items-center justify-end gap-2 border-t border-[#E9E2D4] bg-[#FBF7EC] px-5 py-5 sm:flex-row">
//             <Link
//               href={`/listing-product/${postId}`}
//               className="flex h-9 w-full items-center justify-center rounded-[6px] border border-[#B9C0C7] bg-white px-6 text-[11px] font-extrabold uppercase tracking-wide text-muted transition hover:bg-gray-50 sm:w-auto"
//             >
//               CANCEL
//             </Link>
//             <button
//               type="submit"
//               disabled={isPending || safeStockLeft <= 0 || numQty <= 0 || numQty > safeStockLeft}
//               className="flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-[#F5B02E] px-8 text-[11px] font-extrabold uppercase tracking-wide text-primary-heading shadow-sm transition hover:bg-[#e5a022] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
//             >
//               {isPending ? (
//                 <>
//                   <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-heading border-t-transparent" />
//                   PROCESSING...
//                 </>
//               ) : (
//                 "PAYMENT"
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // Sub-components
// // ---------------------------------------------------------------------------

// function FormField({
//   label,
//   required,
//   children,
// }: {
//   label: string;
//   required?: boolean;
//   children: import("react").JSX.Element | import("react").JSX.Element[] | string;
// }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label className="text-[11px] font-bold text-primary">
//         {required && <span className="mr-0.5 text-rose-500">*</span>}
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// function ReadOnlyInput({
//   value,
//   highlight,
//   muted,
//   icon,
// }: {
//   value: string;
//   highlight?: boolean;
//   muted?: boolean;
//   icon?: import("react").ReactNode;
// }) {
//   return (
//     <div
//       className={`flex h-10 items-center gap-2 rounded-[6px] border border-[#D9DEE4] bg-white px-3 text-[13px] font-semibold ${
//         highlight ? "font-extrabold text-primary" : muted ? "text-muted" : "text-primary-heading"
//       }`}
//     >
//       {icon}
//       {value}
//     </div>
//   );
// }

"use client";

import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import {
  createCropProductOrderAction,
  startCropProductChatAction,
  updateCropProductOrderAction,
} from "@/action/crop-product-order.action";
import { sendChatMessageAction } from "@/app/chat/_actions/sendChatMessageAction";
import { showApiError, showApiSuccess } from "@/lib/apiToast";
import type { PaymentCurrencyCode } from "@/services/payment.service";
import {
  convertCurrencyAmount,
  formatCurrencyAmount,
  getPaymentCurrencyCode,
  roundCurrencyAmount,
} from "@/utils/currency";
import { FALLBACK_KHR_PER_USD } from "@/services/currency-rate.service";
import { MarketPriceWarning } from "@/components/common/MarketPriceWarning";
import { useMarketPriceCheck } from "@/hooks/useMarketPriceCheck";

const CURRENCY_OPTIONS = ["KHR", "USD"] as const;

type Props = {
  postId: string;
  chatRoomId: string;
  sourceChatRoomId?: string;
  farmerId: string;
  buyerName: string;
  pricePerUnit?: number;
  stockLeft?: number;
  initialQuantity?: number;
  unitType?: string;
  currencyCode?: PaymentCurrencyCode;
  cropName?: string;
  cropType?: string;
  title?: string;
  farmerName?: string;
  imageUrls?: string[];
  khrPerUsd?: number;
  orderId?: string;
  mode?: "create" | "edit";
};

export default function CreateOrderWithoutContractForm(props: Props) {
  const {
    postId,
    chatRoomId,
    sourceChatRoomId = "",
    farmerId,
    buyerName,
    pricePerUnit = 0,
    stockLeft = 0,
    initialQuantity = 1,
    unitType = "KG",
    currencyCode = "KHR",
    cropName,
    cropType = "Crop",
    title,
    farmerName = "Farmer",
    khrPerUsd = FALLBACK_KHR_PER_USD,
    orderId,
    mode = "create",
  } = props;

  const router = useRouter();
  const [quantity, setQuantity] = useState<number | "">(initialQuantity);
  const [selectedUnit] = useState(unitType);
  const productCurrency = getPaymentCurrencyCode(currencyCode);
  const [selectedCurrency, setSelectedCurrency] = useState<PaymentCurrencyCode>(
    productCurrency,
  );
  const [unitPrice, setUnitPrice] = useState<string>(
    String(
      roundCurrencyAmount(
        convertCurrencyAmount(pricePerUnit, productCurrency, productCurrency, khrPerUsd),
        productCurrency,
      ),
    ),
  );
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const isEditMode = mode === "edit";

  const safeStockLeft = Math.max(0, stockLeft);
  const displayName = cropName || title || "Crop Product";
  const numQty = typeof quantity === "number" ? quantity : 0;
  const numericUnitPrice = parseFloat(unitPrice) || 0;
  const listedUnitPrice = useMemo(
    () =>
      roundCurrencyAmount(
        convertCurrencyAmount(pricePerUnit, productCurrency, selectedCurrency, khrPerUsd),
        selectedCurrency,
      ),
    [pricePerUnit, productCurrency, selectedCurrency, khrPerUsd],
  );
  const isUnitPriceAboveListed =
    listedUnitPrice > 0 && numericUnitPrice > listedUnitPrice;
  const totalAmount = useMemo(
    () => roundCurrencyAmount(numQty * numericUnitPrice, selectedCurrency),
    [numQty, numericUnitPrice, selectedCurrency],
  );
  const marketPriceCheck = useMarketPriceCheck({
    context: "CROP_PRODUCT_ORDER",
    postId,
    unitType: selectedUnit,
    currencyCode: selectedCurrency,
    pricePerUnit: numericUnitPrice,
    enabled: !isEditMode,
  });

  const formatAmount = (amount: number) =>
    formatCurrencyAmount(amount, selectedCurrency);

  function handleCurrencyChange(nextCurrency: PaymentCurrencyCode) {
    if (nextCurrency === selectedCurrency) return;

    setUnitPrice((currentPrice) => {
      const numericPrice = parseFloat(currentPrice) || 0;
      const convertedPrice = convertCurrencyAmount(
        numericPrice,
        selectedCurrency,
        nextCurrency,
        khrPerUsd,
      );

      return String(
        nextCurrency === "KHR"
          ? Math.round(convertedPrice / 100) * 100
          : roundCurrencyAmount(convertedPrice, nextCurrency),
      );
    });
    setSelectedCurrency(nextCurrency);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!numQty || numQty <= 0) {
      showApiError(new Error("Quantity must be greater than 0."));
      return;
    }

    if (numQty > safeStockLeft) {
      showApiError(new Error(`Only ${safeStockLeft} ${selectedUnit} available.`));
      return;
    }

    if (!numericUnitPrice || numericUnitPrice <= 0) {
      showApiError(new Error("Price per unit must be greater than 0."));
      return;
    }

    if (selectedCurrency === "KHR") {
      if (!Number.isInteger(numericUnitPrice)) {
        showApiError(new Error("Price per unit in KHR cannot include decimal values."));
        return;
      }
      if (numericUnitPrice < 100) {
        showApiError(new Error("Price per unit in KHR must be at least 100."));
        return;
      }
      if (numericUnitPrice % 100 !== 0) {
        showApiError(new Error("Price per unit in KHR must be divisible by 100."));
        return;
      }
    }

    startTransition(async () => {
      if (!isEditMode) {
        void marketPriceCheck.checkNow();
      }

      let resolvedChatRoomId = chatRoomId;

      if (!resolvedChatRoomId) {
        const chatResult = await startCropProductChatAction({
          chatType: "CROP_PRODUCT",
          postId,
          farmerId,
          message: `I want to buy ${displayName}`,
        });

        if (!chatResult.success || !chatResult.chatRoomId) {
          showApiError(new Error(chatResult.error ?? "Failed to start chat"));
          return;
        }

        resolvedChatRoomId = chatResult.chatRoomId;
        if (chatResult.reusedExistingRoom) {
          showApiSuccess(
            "Existing chat found",
            "We opened the existing chat for this crop product.",
          );
        }
      }

      const orderResult =
        isEditMode && orderId
          ? await updateCropProductOrderAction({
              orderId,
              quantity: numQty,
              pricePerUnit: numericUnitPrice,
              depositAmount: totalAmount,
              currencyCode: selectedCurrency,
            })
          : await createCropProductOrderAction({
              postId,
              chatRoomId: resolvedChatRoomId,
              quantity: numQty,
              pricePerUnit: numericUnitPrice,
              depositAmount: totalAmount,
              currencyCode: selectedCurrency,
              contractId: null,
            });

      if (!orderResult.success || !orderResult.data?.orderId) {
        showApiError(new Error(orderResult.error ?? "Order failed"));
        return;
      }

      const createdOrderId = orderResult.data.orderId;

      // Format the chat card in the buyer's chosen currency
      const orderCard =
        `ORDER_REQUEST:${createdOrderId}\n` +
        `crop:${displayName}\n` +
        `qty:${numQty} ${selectedUnit}\n` +
        `price:${formatAmount(numericUnitPrice)} / ${selectedUnit}\n` +
        `total:${formatAmount(totalAmount)}\n` +
        `buyer:${buyerName}\n` +
        `currency:${selectedCurrency}`;

      sessionStorage.setItem(
        `pending_order_message:${resolvedChatRoomId}`,
        orderCard,
      );

      if (sourceChatRoomId && sourceChatRoomId !== resolvedChatRoomId) {
        const linkedMessageResult = await sendChatMessageAction({
          chatRoomId: sourceChatRoomId,
          content: buildLinkedChatNoticeMessage({
            chatRoomId: resolvedChatRoomId,
            chatType: "CROP_PRODUCT",
            title: displayName,
          }),
        });

        if (!linkedMessageResult.success) {
          console.error(
            "Failed to send linked crop-product chat notice:",
            linkedMessageResult.error,
          );
        }
      }

      setIsSuccess(true);

      showApiSuccess(
        isEditMode ? "Order updated" : "Order sent to farmer",
        "Waiting for the farmer to accept your order.",
      );

      setTimeout(() => {
        router.push(`/chat?chatRoomId=${resolvedChatRoomId}`);
      }, 900);
    });
  }

  return (
    <div className="min-h-screen w-full bg-[#fbf6e9] pb-16 text-[#2a2f33]">
      <div className="mx-auto max-w-5xl px-4 pt-6 md:pt-10">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link href="/" className="hover:text-[#107446]">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/chat" className="hover:text-[#107446]">Chat</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#107446] font-bold">Order</span>
        </nav>

        {/* Header */}
        <header className="mb-8 flex flex-col gap-2 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-extrabold md:text-3xl">
            {isEditMode ? "Update Order" : "Order Without Contract"}
          </h1>
          <p className="text-sm text-slate-500">
            Expand your Cambodian produce to the digital marketplace.
          </p>
        </header>

        {/* Success overlay */}
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#107446]" />
              <h2 className="mt-3 text-lg font-bold">
                Order Sent to Farmer
              </h2>
              <p className="text-sm text-slate-500">
                Redirecting to chat...
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
        >
          <h3 className="mb-6 border-b pb-3 text-sm font-bold uppercase text-slate-500">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* Buyer */}
            <Field label="Buyer Name">
              <ReadOnly value={buyerName} />
            </Field>

            {/* Farmer */}
            <Field label="Farmer Name">
              <ReadOnly value={farmerName} />
            </Field>

            {/* Crop */}
            <Field label="Crop">
              <ReadOnly value={displayName} />
            </Field>

            {/* Type */}
            <Field label="Crop Type">
              <ReadOnly value={cropType} />
            </Field>

            {/* Quantity */}
            <Field label="Quantity">
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.]*"
                  value={quantity}
                  min={1}
                  max={safeStockLeft || undefined}
                  onChange={(e) => {
                    const value = e.target.value;

                    setQuantity(value === "" ? "" : Number(value));
                  }}
                  className="flex-1 rounded-xl border px-3 py-2"
                />
                <div className="flex items-center rounded-xl border bg-gray-50 px-3 py-2 text-xs font-bold text-slate-600">
                  {selectedUnit}
                </div>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Available: {safeStockLeft} {selectedUnit}
              </p>
            </Field>

            {/* Price */}
            <Field label="Price Per Unit">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {selectedCurrency === "KHR" ? "៛" : "$"}
                  </span>
                  <input
                    type="text"
                    inputMode={selectedCurrency === "KHR" ? "numeric" : "decimal"}
                    pattern={selectedCurrency === "KHR" ? "[0-9]*" : "[0-9.]*"}
                    step={selectedCurrency === "KHR" ? "100" : "0.01"}
                    min={selectedCurrency === "KHR" ? 100 : 0.01}
                    value={unitPrice}
                    onChange={(event) => {
                      const value = event.target.value;
                      const pattern =
                        selectedCurrency === "KHR"
                          ? /^[0-9]*$/
                          : /^[0-9]*\.?[0-9]*$/;

                      if (value === "" || pattern.test(value)) {
                        setUnitPrice(value);
                      }
                    }}
                    aria-invalid={isUnitPriceAboveListed}
                    className="w-full rounded-xl border px-3 py-2 pl-8 text-sm font-semibold text-slate-600 outline-none focus:border-[#107446] focus:ring-2 focus:ring-[#107446]/10"
                  />
                </div>
                <div className="flex shrink-0 rounded-xl border bg-gray-50 p-1">
                  {CURRENCY_OPTIONS.map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => handleCurrencyChange(currency)}
                      className={`rounded-lg px-3 text-xs font-bold transition ${
                        selectedCurrency === currency
                          ? "bg-[#107446] text-white"
                          : "text-slate-500 hover:text-[#107446]"
                      }`}
                    >
                      {currency}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                Exchange rate: 1 USD = {khrPerUsd.toLocaleString()} KHR
              </p>
              <MarketPriceWarning
                check={marketPriceCheck.data}
                error={marketPriceCheck.error}
                isChecking={marketPriceCheck.isChecking}
                unitType={selectedUnit}
              />
            </Field>

            {/* Total */}
            <Field label="Total Price">
              <ReadOnly value={formatAmount(totalAmount)} highlight />
            </Field>

          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3 border-t pt-5">
            <Link
              href={`/listing-product/${postId}`}
              className="rounded-xl border px-5 py-2 text-xs font-bold"
            >
              Cancel
            </Link>

            <button
              disabled={
                isPending ||
                safeStockLeft <= 0 ||
                numQty <= 0 ||
                numQty > safeStockLeft ||
                numericUnitPrice <= 0
              }
              className="rounded-xl bg-[#107446] px-6 py-2 text-xs font-bold text-white"
            >
              {isPending ? "Processing..." : isEditMode ? "UPDATE & SEND" : "SEND ORDER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function buildLinkedChatNoticeMessage({
  chatRoomId,
  chatType,
  title,
}: {
  chatRoomId: string;
  chatType: "CROP_PRODUCT" | "CROP_DEMAND";
  title: string;
}) {
  return [
    `LINKED_CHAT_ROOM:${chatRoomId}`,
    `TYPE:${chatType}`,
    `TITLE:${title.replace(/\s+/g, " ").trim()}`,
  ].join("\n");
}

/* UI helpers */

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function ReadOnly({
  value,
  highlight,
  className = "",
}: {
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${className} ${
        highlight ? "text-[#107446]" : "text-slate-600"
      }`}
    >
      {value}
    </div>
  );
}
