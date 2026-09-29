"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReportMediaUpload from "./ReportMediaUpload";
import ReportDetailsForm from "./ReportDetailsForm";
import { createReportAction } from "@/action/Report.action";
import { showApiError, showApiSuccess } from "@/lib/apiToast";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { IssueType } from "@/types/report";
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";

type UserRole = "farmer" | "buyer" | "government";

type ReportIssueProps = {
  role: UserRole;
  orderId: string;
  reportedUserId: string;
  reportedUserName?: string;
  from?: string;
};

// Mirrors the order-code format used across the app: #ORD-{last 4 of UUID}.
const formatOrderCode = (orderId: string) => {
  const suffix = orderId?.trim().slice(-4).toUpperCase() || "----";
  return `#ORD-${suffix}`;
};

const issueTypeMap: Record<string, IssueType> = {
  "Term & Condition Violate Issue": "VIOLATION_TERMS",
  "Escrow / Payment Issue": "ESCROW_PAYMENT",
  "Contract Issue": "CONTRACT",
  "Delivery Issue": "DELIVERY",
  Other: "OTHER",
};

// Localized string map for popup alerts, labels, and headers
const POPUP_TEXT = {
  title: { en: "Report an Issue", kh: "រាយការណ៍បញ្ហា" },
  subtitle: {
    en: "File a formal report regarding a transaction, compliance issue, or counterparty. Accurate details ensure a swift resolution by our oversight team.",
    kh: "ដាក់បញ្ជូនរបាយការណ៍ផ្លូវការទាក់ទងនឹងប្រតិបត្តិការ បញ្ហាអនុលោមភាព ឬដៃគូកិច្ចសន្យា។ ព័ត៌មានលម្អិតច្បាស់លាស់ធានានូវដំណោះស្រាយរហ័សពីក្រុមការងាររបស់យើង។",
  },
  missingInfo: {
    en: "Missing order or user information. Please go back and try again.",
    kh: "ខ្វះព័ត៌មានការបញ្ជាទិញ ឬព័ត៌មានអ្នកប្រើប្រាស់។ សូមត្រឡប់ក្រោយ ហើយព្យាយាមម្តងទៀត។",
  },
  uploadingImages: {
    en: "Please wait for all images to finish uploading.",
    kh: "សូមរង់ចាំរហូតដល់រូបភាពទាំងអស់ត្រូវបានបង្ហោះរួចរាល់។",
  },
  unexpectedError: {
    en: "An unexpected error occurred. Please try again.",
    kh: "មានកំហុសមិនរំពឹងទុកមួយបានកើតឡើង។ សូមព្យាយាមម្តងទៀត។",
  },
  submitFailed: {
    en: "Failed to submit report. Please try again.",
    kh: "ការដាក់បញ្ជូនរបាយការណ៍បានបរាជ័យ។ សូមព្យាយាមម្តងទៀត។",
  },
  successTitle: { en: "Report submitted", kh: "បានដាក់បញ្ជូនរបាយការណ៍" },
  successDesc: {
    en: "Report submitted successfully.",
    kh: "របាយការណ៍ត្រូវបានដាក់បញ្ជូនដោយជោគជ័យ។",
  },
  breadcrumbHome: { en: "Home", kh: "ទំព័រដើម" },
  breadcrumbHistory: { en: "Order History", kh: "ប្រវត្តិបញ្ជាទិញ" },
  breadcrumbDetail: { en: "Order Detail", kh: "ព័ត៌មានលម្អិតការបញ្ជាទិញ" },
  breadcrumbDelivery: { en: "Delivery", kh: "ការដឹកជញ្ជូន" },
} as const;

function ReportIssueInner({
  orderId,
  reportedUserId,
  reportedUserName,
  role,
  from,
}: ReportIssueProps) {
  const router = useRouter();
  const { language } = useI18n();
  const isKh = language === "kh";

  const getTxt = (key: keyof typeof POPUP_TEXT) => POPUP_TEXT[key][isKh ? "kh" : "en"];

  const breadcrumbs: { label: string; href?: string }[] = [
    { label: getTxt("breadcrumbHome"), href: "/" },
    { label: getTxt("breadcrumbHistory"), href: "/order-history" },
    { label: getTxt("breadcrumbDetail"), href: `/order-history/${orderId}` },
    ...(from === "delivery"
      ? [{ label: getTxt("breadcrumbDelivery"), href: `/delivery?role=${role}&orderId=${orderId}` }]
      : []),
    { label: getTxt("title") },
  ];

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmitReport = async (values: {
    issueType: string;
    reportTitle: string;
    customIssue?: string;
    description?: string;
  }) => {
    if (submittingRef.current) return;

    if (!orderId || !reportedUserId) {
      showApiError(new Error(getTxt("missingInfo")));
      return;
    }

    if (images.some((url) => url.startsWith("blob:"))) {
      showApiError(new Error(getTxt("uploadingImages")));
      return;
    }

    const mappedIssueType: IssueType = issueTypeMap[values.issueType] ?? "OTHER";

    submittingRef.current = true;
    setIsSubmitting(true);

    let result;
    try {
      result = await createReportAction({
        title: values.reportTitle,
        description: values.description ?? "",
        issueType: mappedIssueType,
        orderId,
        reportedUserId,
        attachmentUrls: images,
      });
    } catch (err) {
      submittingRef.current = false;
      setIsSubmitting(false);
      showApiError(
        err instanceof Error ? err : new Error(getTxt("unexpectedError"))
      );
      return;
    }

    if (!result.success) {
      submittingRef.current = false;
      setIsSubmitting(false);
      showApiError(
        new Error(result.error ?? getTxt("submitFailed"))
      );
      return;
    }

    showApiSuccess(getTxt("successTitle"), getTxt("successDesc"));
    router.push("/order-history");
  };

  const handleCancel = () => {
    router.push(`/order-history/${orderId}`);
  };

  return (
    <div className={`w-full px-1 py-6 pb-16 sm:px-0 md:pb-20 ${isKh ? "font-khmer" : ""}`}>
      <section className="flex w-full flex-col">
        <BreadcrumbNav
          items={breadcrumbs}
          className="mx-0 mb-2 max-w-none overflow-x-auto py-0"
        />

        <div className="mt-5 w-full">
          <div className="mb-4 w-full">
            <h1 className="text-xl font-bold text-[#1f2933] sm:text-2xl">
              {getTxt("title")}
            </h1>
            <p className="mt-1 max-w-4xl text-xs font-medium leading-5 text-[#6b7280] sm:text-sm">
              {getTxt("subtitle")}
            </p>
          </div>

          <div className="grid w-full gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <ReportMediaUpload images={images} setImages={setImages} />

            <ReportDetailsForm
              onSubmit={handleSubmitReport}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              reportedUserName={reportedUserName}
              orderCode={formatOrderCode(orderId)}
              imageCount={images.length}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ReportIssue({
  role,
  orderId,
  reportedUserId,
  reportedUserName,
  from,
}: ReportIssueProps) {
  return (
    <Suspense fallback={null}>
      <ReportIssueInner
        role={role}
        orderId={orderId}
        reportedUserId={reportedUserId}
        reportedUserName={reportedUserName}
        from={from}
      />
    </Suspense>
  );
}
