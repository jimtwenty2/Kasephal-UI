"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getActiveCropProductOrderChatAction } from "@/action/crop-product-order.action";
import { showApiToast } from "@/lib/apiToast";
import { useI18n } from "@/lib/i18n/I18nContext";

const BUY_NOW_TEXT = {
  "buyNow.notAvailable": { en: "This crop product is not available.", kh: "ផលិតផលដំណាំនេះមិនមានទេ។" },
  "buyNow.productReady": { en: "Product ready", kh: "ផលិតផលរួចរាល់" },
  "buyNow.productUnavailable": { en: "Product unavailable", kh: "ផលិតផលមិនមាន" },
  "buyNow.missingReference": { en: "Missing product or farmer reference.", kh: "ខ្វះឯកសារយោងផលិតផល ឬកសិករ។" },
  "buyNow.cannotStartOrder": { en: "Cannot start order", kh: "មិនអាចចាប់ផ្តើមបញ្ជាទិញបាន" },
  "buyNow.button": { en: "Buy Now", kh: "ទិញឥឡូវនេះ" },
} as const;

function getBuyNowText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  return (key: string) => BUY_NOW_TEXT[key as keyof typeof BUY_NOW_TEXT]?.[lang] ?? key;
}

type Props = {
  postId: string;
  farmerId: string;
  disabled?: boolean;
  disabledMessage?: string;
};

export default function BuyNowButton({
  postId,
  farmerId,
  disabled,
  disabledMessage,
}: Props) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getBuyNowText(language);
  const [isCheckingOrder, setIsCheckingOrder] = useState(false);

  const handleBuyNow = async () => {
    if (disabled) {
      showApiToast(
        { success: false, error: disabledMessage ?? t("buyNow.notAvailable") },
        {
          successTitle: t("buyNow.productReady"),
          errorTitle: disabledMessage
            ? t("buyNow.cannotStartOrder")
            : t("buyNow.productUnavailable"),
        },
      );
      return;
    }

    if (!postId || !farmerId) {
      showApiToast(
        { success: false, error: t("buyNow.missingReference") },
        {
          successTitle: "Product ready",
          errorTitle: t("buyNow.cannotStartOrder"),
        },
      );
      return;
    }

    setIsCheckingOrder(true);

    try {
      const activeOrderResult = await getActiveCropProductOrderChatAction({
        postId,
        farmerId,
      });

      if (activeOrderResult.success && activeOrderResult.data?.chatRoomId) {
        router.push(
          `/chat?chatRoomId=${encodeURIComponent(activeOrderResult.data.chatRoomId)}`,
        );
        return;
      }

      router.push(
        `/order-crop-product?postId=${encodeURIComponent(postId)}&farmerId=${encodeURIComponent(farmerId)}`,
      );
    } finally {
      setIsCheckingOrder(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleBuyNow()}
      disabled={disabled || isCheckingOrder}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#F6B941] px-5 py-3 text-xs font-bold text-[#1D2939] shadow-xs transition-all hover:bg-[#e0a634] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
    >
      <ShoppingBag size={16} />
      {isCheckingOrder ? "Checking..." : t("buyNow.button")}
    </button>
  );
}
