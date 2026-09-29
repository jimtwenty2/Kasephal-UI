"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, FileCheck, LockKeyhole } from "lucide-react";
import { orderWithContractSchema, type OrderWithContractValues, type OrderWithContractInput } from "@/lib/orderWithContract";
import { createCropDemandOrderAction } from "@/action/crop-product-order.action";
import { findOrderIdByContractAction } from "@/action/order.action";
import { showApiError, showApiSuccess } from "@/lib/apiToast";
import { formatCurrencyAmount, roundCurrencyAmount } from "@/utils/currency";

type OrderWithContractFormProps = {
  postId: string;
  chatRoomId: string;
  farmerId: string;
  contractId?: string | null;
  buyerName?: string;
  farmerName?: string;
  cropName?: string;
  cropType?: string;
  title?: string;
  pricePerUnit?: number;
  depositAmount?: number;
  stockLeft?: number;
  unitType?: string;
  currencyCode?: "USD" | "KHR";
  deliveryDate?: string;
  imageUrls?: string[];
  khrPerUsd?: number;
};

// Map any incoming unit string onto the two units this form supports.
function toFormUnit(unit?: string): "KG" | "TONS" {
  return unit === "TON" || unit === "TONS" ? "TONS" : "KG";
}

export default function OrderWithContractForm({
  chatRoomId,
  contractId = null,
  buyerName = "",
  farmerName = "Farmer",
  cropName = "",
  cropType = "",
  title = "",
  pricePerUnit = 0,
  depositAmount = 0,
  stockLeft = 0,
  unitType,
  currencyCode = "KHR",
  deliveryDate = "",
}: OrderWithContractFormProps) {
  const router = useRouter();
  // Success popup shown after the buyer's KHQR payment settles.
  // In-place KHQR payment state. Clicking "Payment" creates the (auto-accepted)
  // order, then a KHQR for its deposit; the buyer scans here and we poll Bakong
  // for settlement — no detour to a separate payment page.
  // Reuse the resolved order across retries so an expired/closed QR doesn't
  // create a second order (POST /payment is idempotent per order).
  // Background polling fires every 15s; only surface a check error once per QR
  // session so a persistent backend error doesn't spam the buyer.
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderWithContractInput, unknown, OrderWithContractValues>({
    resolver: zodResolver(orderWithContractSchema),
    defaultValues: {
      buyerName: buyerName || "Buyer",
      farmerName: farmerName || "Farmer",
      cropName: cropName || title || "Crop",
      cropType: cropType || "RICE",
      quantity: stockLeft > 0 ? stockLeft : 1,
      unitType: toFormUnit(unitType),
      pricePerUnit: pricePerUnit > 0 ? pricePerUnit : 0,
      currencyCode,
      totalPrice: 0,
      deliveryDate: deliveryDate || "",
      depositPercentage: 30,
      remainingBalance: 0,
      totalPayment: depositAmount,
      deposit: depositAmount,
    },
  });

  // Watch fields dynamically to automatically calculate math updates
  const watchedQuantity = useWatch({ control, name: "quantity" }) || 0;
  const watchedPricePerUnit = useWatch({ control, name: "pricePerUnit" }) || 0;

  // Real-time calculation engine. The deposit is fixed by the contract (not a
  // percentage the buyer picks); the remaining balance follows from it.
  const financialCalculations = useMemo(() => {
    const total = Number(watchedQuantity) * Number(watchedPricePerUnit);
    const remaining = Math.max(0, total - depositAmount);

    return { total, depositAmount, remaining };
  }, [watchedQuantity, watchedPricePerUnit, depositAmount]);

  useEffect(() => {
    setValue("totalPrice", financialCalculations.total, { shouldValidate: true });
    setValue("totalPayment", financialCalculations.depositAmount, { shouldValidate: true });
    setValue("remainingBalance", financialCalculations.remaining, { shouldValidate: true });
    setValue("deposit", financialCalculations.depositAmount, { shouldValidate: true });

    // depositPercentage is no longer entered, but the schema still expects a
    // 1–100 value — derive it from the contract's deposit so validation passes.
    const pct =
      financialCalculations.total > 0
        ? Math.min(
            100,
            Math.max(
              1,
              Math.round(
                (financialCalculations.depositAmount / financialCalculations.total) * 100,
              ),
            ),
          )
        : 1;
    setValue("depositPercentage", pct, { shouldValidate: true });
  }, [financialCalculations, setValue]);

  const onSubmit = async (data: OrderWithContractValues) => {
    if (!contractId) {
      showApiError(new Error("Missing contract reference for this order."));
      return;
    }

    if (!chatRoomId) {
      showApiError(new Error("Missing chat room reference for this order."));
      return;
    }

    // A crop-demand order derives every term from its contract, so the API only
    // takes the contract id and the deposit to fund. The deposit is the
    // contract's actual amount, in the contract's currency.
    const depositAmount = roundCurrencyAmount(data.totalPayment, currencyCode);

    const orderResult = await createCropDemandOrderAction({
      contractId,
      depositAmount,
      currencyCode,
      pricePerUnit: data.pricePerUnit,
    });

    if (!orderResult.success || !orderResult.data?.orderId) {
      const existingOrderId = await findOrderIdByContractAction(contractId);
      if (existingOrderId) {
        router.push(`/order-history/${existingOrderId}`);
        return;
      }

      showApiError(new Error(orderResult.error ?? "Failed to create order."));
      return;
    }

    const createdOrderId = orderResult.data.orderId;
    const unit = toFormUnit(unitType);
    const orderCard =
      `ORDER_CREATED:${createdOrderId}\n` +
      `crop:${cropName || title || "Crop"}\n` +
      `qty:${data.quantity} ${unit}\n` +
      `price:${formatCurrencyAmount(data.pricePerUnit, currencyCode)} / ${unit}\n` +
      `total:${formatCurrencyAmount(data.totalPrice, currencyCode)}\n` +
      `delivery:${data.deliveryDate}\n` +
      `buyer:${data.buyerName}\n` +
      `currency:${currencyCode}\n` +
      `chatRoomId:${chatRoomId}\n` +
      `paymentPath:/payment-demands`;

    sessionStorage.setItem(`pending_order_message:${chatRoomId}`, orderCard);

    showApiSuccess(
      "Order created",
      "You can pay from the order card in chat.",
    );

    router.push(`/chat?chatRoomId=${encodeURIComponent(chatRoomId)}`);
  };

  // No currency toggle on the order — the sign follows the contract's currency.
  const currencySign = currencyCode === "USD" ? "$" : "៛";

  return (
    <div className="min-h-screen w-full bg-transparent pb-16 font-thicccboi text-foreground antialiased selection:bg-[#107446]/10">
      
      <div className="mx-auto max-w-5xl px-4 pt-6 md:pt-10">
        
        {/* Navigation Breadcrumbs */}
        <nav className="mb-6 flex items-center justify-between">
          <ul className="flex items-center gap-2 text-xs font-semibold text-slate-400 md:text-sm">
            <li><Link href="/" className="hover:text-[#107446] transition-colors">Home</Link></li>
            <ChevronRight className="h-3.5 w-3.5 opacity-60 text-slate-400" />
            <li>
              <Link
                href={`/chat?chatRoomId=${encodeURIComponent(chatRoomId)}`}
                className="transition-colors hover:text-[#107446]"
              >
                Chat
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 opacity-60 text-slate-400" />
            <li className="font-bold text-[#107446]">Order</li>
          </ul>
        </nav>

        {/* Minimalist Top Header Layout */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-200 text-[#107446] shadow-2xs">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#2a2f33] sm:text-3xl">
                Order With Contract
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Review the accepted contract terms before creating the escrow order.
              </p>
            </div>
          </div>
          
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-bold text-green-700 tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-[#107446] animate-pulse" />
              Contract Terms Locked
            </span>
          </div>
        </header>
        
        {/* Main Content Form Container */}
        <form 
          onSubmit={(e) => handleSubmit(onSubmit)(e)}
          className="w-full rounded-2xl border border-gray-200/80 bg-white p-6 md:p-8 shadow-xs relative overflow-hidden transition-all duration-300 focus-within:shadow-md"
        >

          <div className="flex items-center gap-2.5 mb-8 pb-4 border-b border-gray-100">
            <div className="h-5 w-1.5 bg-[#107446] rounded-full" />
            <h3 className="text-base font-bold text-[#2a2f33] tracking-wider uppercase">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Buyer Name - fixed by the contract */}
            <div className="group flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                <span className="text-red-400 font-serif">*</span> Buyer / Government Name
              </label>
              <input
                type="text"
                readOnly
                {...register("buyerName")}
                className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
              />
              {errors.buyerName && <p className="text-xs font-semibold text-red-500">{errors.buyerName.message}</p>}
            </div>

            {/* Farmer Name - fixed by the contract */}
            <div className="group flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                <span className="text-red-400 font-serif">*</span> Farmer Name
              </label>
              <input
                type="text"
                readOnly
                {...register("farmerName")}
                className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
              />
              {errors.farmerName && <p className="text-xs font-semibold text-red-500">{errors.farmerName.message}</p>}
            </div>

            {/* Crop Name - fixed by the contract */}
            <div className="group flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                <span className="text-red-400 font-serif">*</span> Crop Name
              </label>
              <input
                type="text"
                readOnly
                {...register("cropName")}
                className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
              />
              {errors.cropName && <p className="text-xs font-semibold text-red-500">{errors.cropName.message}</p>}
            </div>

            {/* Crop Type — fixed by the contract, shown read-only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                <span className="text-red-400 font-serif">*</span> Crop Type
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  {...register("cropType")}
                  placeholder="Crop Type"
                  className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 placeholder:text-gray-400 outline-none"
                />
              </div>
              {errors.cropType && <p className="text-xs font-semibold text-red-500">{errors.cropType.message}</p>}
            </div>

            {/* Quantity - fixed by the contract */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                <span className="text-red-400 font-serif">*</span> Quantity
              </label>
              <input
                type="number"
                step="0.01"
                readOnly
                {...register("quantity")}
                className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
              />
              {errors.quantity && <p className="text-xs font-semibold text-red-500">{errors.quantity.message}</p>}
            </div>

            {/* Price Per Unit - fixed by the contract */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wide">
                  <span className="text-red-400 font-serif">*</span> Price Per Unit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    readOnly
                    {...register("pricePerUnit")}
                    placeholder="Price Per Unit"
                    className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 placeholder:text-gray-400 outline-none"
                  />
                </div>
                {errors.pricePerUnit && <p className="text-xs font-semibold text-red-500">{errors.pricePerUnit.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wide">
                  <span className="text-red-400 font-serif">*</span> Unit
                </label>
                <input
                  type="text"
                  readOnly
                  {...register("unitType")}
                  className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
                />
                {errors.unitType && <p className="text-xs font-semibold text-red-500">{errors.unitType.message}</p>}
              </div>
             
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wide">
                  <span className="text-red-400 font-serif">*</span> Currency
                </label>
                {/* No toggle on the order — currency is fixed by the contract. */}
                <div className="flex h-[46px] items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-xs font-bold text-slate-700">
                  {currencyCode} ({currencySign})
                </div>
              </div>
            </div>

            {/* Total Price Auto Calculated Field */}
            <div className="group flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                Total Price
              </label>
              <div className="relative rounded-xl bg-gradient-to-r from-emerald-50/40 via-green-50/20 to-emerald-100/30 p-0.5 border border-emerald-100">
                <input
                  type="text"
                  disabled
                  value={`${financialCalculations.total.toLocaleString()}${currencySign}`}
                  className="w-full rounded-xl bg-transparent px-4 py-3 text-sm font-bold text-[#107446] outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Delivery Date Input box */}
            <div className="group flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                <span className="text-red-400 font-serif">*</span> Delivery Date
              </label>
              <input
                id="order-contract-delivery-date"
                type="text"
                readOnly
                {...register("deliveryDate")}
                className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
              />
              {errors.deliveryDate && <p className="text-xs font-semibold text-red-500">{errors.deliveryDate.message}</p>}
            </div>

            {/* Deposit Amount — fixed by the contract, shown read-only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                <span className="text-red-400 font-serif">*</span> Deposit Amount
              </label>
              <input
                type="text"
                value={`${financialCalculations.depositAmount.toLocaleString()}${currencySign}`}
                readOnly
                className="w-full cursor-default rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
              />
            </div>

            {/* Remaining Balance Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                Remaining balance
              </label>
              <div className="relative rounded-xl bg-gray-50 border border-gray-200">
                <input
                  type="text"
                  disabled
                  value={`${financialCalculations.remaining.toLocaleString()}${currencySign}`}
                  className="w-full rounded-xl bg-transparent px-4 py-3 text-sm font-medium text-slate-700 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Total Payment/Deposit Amount field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wide">
                Total Payment
              </label>
              <div className="relative rounded-xl bg-gradient-to-r from-amber-50/50 to-amber-100/40 p-0.5 border border-amber-200">
                <input
                  type="text"
                  disabled
                  value={`${financialCalculations.depositAmount.toLocaleString()}${currencySign}`}
                  className="w-full rounded-xl bg-transparent px-4 py-3 text-base font-extrabold text-amber-700 outline-none cursor-not-allowed"
                />
              </div>
            </div>

          </div>

          {/* Action Footer Options group */}
          <div className="mt-10 flex justify-end gap-3 border-t border-gray-100 pt-6">
            {/* Submitting creates the (auto-accepted) crop-demand order, then a
                KHQR payment for its deposit shown in-place — no page redirect. */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px] bg-[#F2C94C] hover:bg-[#ebd043] text-[#2D3134] font-bold text-xs uppercase tracking-wider py-3 px-8 rounded-lg transition-all shadow-sm active:scale-[0.98] flex items-center justify-center text-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              {isSubmitting ? "Processing..." : "Create Order"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

