"use client";

import Link from "next/link";
import { ShieldAlert, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { ReportStatus } from "@/types/report";

type ReportBlockedNoticeProps = {
  status: ReportStatus;
  orderId: string;
};

const TEXT = {
  approvedTitle: {
    en: "This order already has an approved report",
    kh: "ការបញ្ជាទិញនេះមានរបាយការណ៍ដែលត្រូវបានអនុម័តរួចហើយ",
  },
  approvedBody: {
    en: "The reported issue has been resolved by our oversight team. No further reports can be filed for this order.",
    kh: "បញ្ហាដែលបានរាយការណ៍ត្រូវបានដោះស្រាយដោយក្រុមការងាររបស់យើង។ មិនអាចដាក់បញ្ជូនរបាយការណ៍បន្ថែមសម្រាប់ការបញ្ជាទិញនេះបានទេ។",
  },
  activeTitle: {
    en: "You already have an active report for this order",
    kh: "អ្នកមានរបាយការណ៍សកម្មសម្រាប់ការបញ្ជាទិញនេះរួចហើយ",
  },
  activeBody: {
    en: "Your report is currently being reviewed. Please wait for our oversight team to respond before filing another one.",
    kh: "របាយការណ៍របស់អ្នកកំពុងត្រូវបានពិនិត្យ។ សូមរង់ចាំក្រុមការងាររបស់យើងឆ្លើយតបមុននឹងដាក់បញ្ជូនម្តងទៀត។",
  },
  backToOrder: { en: "Back to Order", kh: "ត្រឡប់ទៅការបញ្ជាទិញ" },
} as const;

export default function ReportBlockedNotice({
  status,
  orderId,
}: ReportBlockedNoticeProps) {
  const { language } = useI18n();
  const isKh = language === "kh";
  const txt = (key: keyof typeof TEXT) => TEXT[key][isKh ? "kh" : "en"];

  const isApproved = status === "APPROVED";

  return (
    <div className={`w-full py-10 ${isKh ? "font-khmer" : ""}`}>
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-[20px] border border-[#d9e2ec] bg-white p-8 text-center shadow-sm">
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            isApproved ? "bg-[#e8f5ee] text-[#08743f]" : "bg-[#fef3dc] text-[#b87503]"
          }`}
        >
          {isApproved ? <ShieldAlert size={26} /> : <Clock size={26} />}
        </div>

        <h1 className="text-lg font-bold text-[#1f2933] sm:text-xl">
          {isApproved ? txt("approvedTitle") : txt("activeTitle")}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#6b7280]">
          {isApproved ? txt("approvedBody") : txt("activeBody")}
        </p>

        <Link
          href={`/order-history/${orderId}`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#08743f] px-6 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#0a5f35]"
        >
          {txt("backToOrder")}
        </Link>
      </div>
    </div>
  );
}
