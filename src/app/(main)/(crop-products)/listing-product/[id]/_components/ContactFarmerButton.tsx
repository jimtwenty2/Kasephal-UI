"use client";

import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { showApiToast } from "@/lib/apiToast";
import { useI18n } from "@/lib/i18n/I18nContext";

const CONTACT_FARMER_TEXT = {
  "contactFarmer.lockedMessage": { en: "Please verify your identity document before contacting a farmer.", kh: "សូមផ្ទៀងផ្ទាត់ឯកសារអត្តសញ្ញាណរបស់អ្នក មុនពេលទាក់ទងកសិករ។" },
  "contactFarmer.chatUnlocked": { en: "Chat unlocked", kh: "បានបើកការជជែក" },
  "contactFarmer.identityRequired": { en: "Identity verification required", kh: "ត្រូវការផ្ទៀងផ្ទាត់អត្តសញ្ញាណ" },
  "contactFarmer.button": { en: "Chat Farmer", kh: "ជជែកជាមួយកសិករ" },
} as const;

function getContactFarmerText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  return (key: string) => CONTACT_FARMER_TEXT[key as keyof typeof CONTACT_FARMER_TEXT]?.[lang] ?? key;
}

type Props = {
    postId: string;
    farmerId: string;
    farmerName?: string;
    farmerLocation?: string;
    isVerifiedIdentity?: boolean;
    lockedMessage?: string;
};

const buttonClass =
    "flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-xs font-bold text-emerald-800 shadow-xs transition-all hover:bg-emerald-50 active:scale-[0.99] sm:w-auto";

export default function ContactFarmerButton({
    postId,
    farmerId,
    farmerName,
    farmerLocation,
    isVerifiedIdentity = true,
    lockedMessage,
}: Props) {
    const router = useRouter();
    const { language } = useI18n();
    const t = getContactFarmerText(language);

    const handleContactFarmer = () => {
        if (!isVerifiedIdentity) {
            showApiToast(
                { success: false, error: lockedMessage ?? t("contactFarmer.lockedMessage") },
                {
                    successTitle: t("contactFarmer.chatUnlocked"),
                    errorTitle: t("contactFarmer.identityRequired"),
                },
            );
            return;
        }

        const params = new URLSearchParams({
            new: "true",
            postId,
            farmerId,
            chatType: "CROP_PRODUCT",
        });

        if (farmerName) params.set("farmerName", farmerName);
        if (farmerLocation) params.set("farmerLocation", farmerLocation);

        router.push(`/chat?${params.toString()}`);
    };

    return (
        <button type="button" onClick={handleContactFarmer} className={buttonClass}>
            <MessageCircle size={16} />
            {t("contactFarmer.button")}
        </button>
    );
}