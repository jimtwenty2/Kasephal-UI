"use client";

import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  withdrawalRequest: {
    en: "Withdrawal Request",
    kh: "សំណើដកប្រាក់",
  },
  description: {
    en: "Manage and request funds from your available balance.",
    kh: "គ្រប់គ្រង និងស្នើសុំដកប្រាក់ពីសមតុល្យដែលអាចប្រើបានរបស់អ្នក។",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

export default function WithdrawalHeader() {
  const { language } = useI18n();
  const t = getText(language as Language);

  return (
    <div>
      <h1 className="text-[28px] font-bold text-primary-heading">
        {t("withdrawalRequest")}
      </h1>

      <p className="mt-2 text-[15px] font-medium text-secondary-body">
        {t("description")}
      </p>
    </div>
  );
}