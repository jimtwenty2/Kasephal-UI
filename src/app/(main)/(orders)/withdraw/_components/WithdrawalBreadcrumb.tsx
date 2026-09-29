// _components/WithdrawalBreadcrumb.tsx
"use client";

import Link from "next/link";
import { UserRole } from "@/types/user-role";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  home: { en: "Home", kh: "ទំព័រដើម" },
  orderHistory: { en: "Order History", kh: "ប្រវត្តិការបញ្ជាទិញ" },
  orderDetail: { en: "Order Detail", kh: "ព័ត៌មានលម្អិតការបញ្ជាទិញ" },
  requestWithdraw: { en: "Request Withdraw", kh: "ស្នើសុំដកប្រាក់" },
  requestRefund: { en: "Request Refund", kh: "ស្នើសុំសងប្រាក់វិញ" },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

type WithdrawalBreadcrumbProps = {
  role: UserRole;
  orderDetailHref: string;
};

export default function WithdrawalBreadcrumb({
  role,
  orderDetailHref,
}: WithdrawalBreadcrumbProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  const isFarmer = role === UserRole.FARMER;
  const currentLabel = isFarmer ? t("requestWithdraw") : t("requestRefund");

  return (
    <nav className="flex items-center pt-8 text-xs text-muted md:text-sm">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Link href="/" className="hover:underline">
          {t("home")}
        </Link>

        <span>&rsaquo;</span>

        <Link href="/order-history" className="text-muted hover:underline">
          {t("orderHistory")}
        </Link>

        <span>&rsaquo;</span>

        <Link href={orderDetailHref} className="text-muted hover:underline">
          {t("orderDetail")}
        </Link>

        <span>&rsaquo;</span>

        <span className="font-bold text-primary">{currentLabel}</span>
      </div>
    </nav>
  );
}