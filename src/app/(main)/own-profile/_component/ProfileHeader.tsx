"use client";
import React, { useCallback, useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Grid2x2Check,
  KeyRound,
  Mail,
  MessageCircle,
  PencilLine,
  Phone,
  User,
  UserCheck,
  UserPen,
  UserPlus,
  Verified,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { UserProfilePayload } from "@/types/user";
import {
  PersonalInformation,
  UpdatePassword,
  BakongAccount,
  AddLoginIdentifier,
} from "./ProfileModal";
import { getFileUrl } from "@/utils/getFileUrl";
import { formatCambodiaPhone } from "@/utils/formatCambodiaPhone";
import { followFarmer, unfollowFarmer, getFollowStatus } from "@/action/follow.action";
import { showApiError } from "@/lib/apiToast";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { useI18n } from "@/lib/i18n/I18nContext";

const PROFILE_TEXT = {
  "Profile.edit.phone": { en: "Add Phone Number", kh: "បន្ថែមលេខទូរស័ព្ទ" },
  "prfile.dob": { en: "Date Of Birth", kh: "ថ្ងៃខែឆ្នាំកំណើត" },
  "profile.bName": { en: "Buyer Name", kh: "ឈ្មោះអ្នកទិញ" },
  "profile.bio.empty": { en: "No bio available.", kh: "មិនមានជីវប្រវត្តិទេ។" },
  "profile.btn-cancel": { en: "Cancel", kh: "បោះបង់" },
  "profile.busType": { en: "Business Type", kh: "ប្រភេទអាជីវកម្ម" },
  "profile.checking": { en: "CHECKING...", kh: "កំពុងពិនិត្យ..." },
  "profile.description.unfollow": { en: "You will stop following this farmer and will no longer see their updates as followed content.", kh: "អ្នកនឹងឈប់តាមដានកសិករនេះ ហើយនឹងមិនឃើញព័ត៌មានថ្មីៗរបស់គាត់ក្នុងមាតិកាដែលបានតាមដានទៀតទេ។" },
  "profile.edit-bakong": { en: "Update Bakong", kh: "ធ្វើបច្ចុប្បន្នភាពបាគង" },
  "profile.edit-email": { en: "Add Email Address", kh: "បន្ថែមអាសយដ្ឋានអ៊ីមែល" },
  "profile.edit-password": { en: "Update Password", kh: "ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់" },
  "profile.edit-personalInfo": { en: "Personal Information", kh: "ព័ត៌មានផ្ទាល់ខ្លួន" },
  "profile.email": { en: "Email", kh: "អ៊ីមែល" },
  "profile.fallback.na": { en: "N/A", kh: "មិនមាន" },
  "profile.farm": { en: "Farm Size", kh: "ទំហំកសិដ្ឋាន" },
  "profile.farmer": { en: "Farmer", kh: "កសិករ" },
  "profile.fname": { en: "FARMER NAME", kh: "ឈ្មោះកសិករ" },
  "profile.follow": { en: "FOLLOW", kh: "តាមដាន" },
  "profile.following": { en: "FOLLOWING", kh: "កំពុងតាមដាន" },
  "profile.followingProgress": { en: "FOLLOWING...", kh: "កំពុងតាមដាន..." },
  "profile.image.invalidType": { en: "Only PNG, JPG, and JPEG images are allowed.", kh: "អនុញ្ញាតតែរូបភាព PNG, JPG និង JPEG ប៉ុណ្ណោះ។" },
  "profile.left-btn": { en: "EDIT PROFILE", kh: "កែប្រែប្រវត្តិរូប" },
  "profile.mName": { en: "Ministry Name", kh: "ឈ្មោះក្រសួង" },
  "profile.message": { en: "MESSAGE", kh: "សារ" },
  "profile.not-add": { en: "Not Added", kh: "មិនទាន់បានបន្ថែម" },
  "profile.phone": { en: "Phone Number", kh: "លេខទូរស័ព្ទ" },
  "profile.popupUnfollow": { en: "Unfollow this farmer?", kh: "ឈប់តាមដានកសិករនេះមែនទេ?" },
  "profile.rigt-btn": { en: "GO TO DASHBOARD", kh: "ទៅកាន់ផ្ទាំងគ្រប់គ្រង" },
  "profile.role.buyer": { en: "Buyer", kh: "អ្នកទិញ" },
  "profile.role.government": { en: "Government", kh: "រដ្ឋាភិបាល" },
  "profile.score": { en: "Trust Score", kh: "ពិន្ទុទំនុកចិត្ត" },
  "profile.trust.bronze": { en: "Bronze", kh: "សំរិទ្ធ" },
  "profile.trust.gold": { en: "Gold", kh: "មាស" },
  "profile.trust.silver": { en: "Silver", kh: "ប្រាក់" },
  "profile.unit.hectares": { en: "hectares", kh: "ហិកតា" },
  "profile.unverified": { en: "Unverified", kh: "មិនទាន់បានផ្ទៀងផ្ទាត់" },
  "profile.verified": { en: "Verified", kh: "បានផ្ទៀងផ្ទាត់" },
} as const;

function getProfileText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PROFILE_TEXT[key as keyof typeof PROFILE_TEXT]?.[lang] ?? key;
}


// Types

export type UserRole = "farmer" | "buyer" | "government";

type ActiveForm = "personal" | "password" | "bakong" | "add-identifier" | null;

type InfoItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

const NO_PROFILE_IMAGE = "/assets/no-profile.jpg";

function formatDisplayDate(dateString: string | null | undefined, fallback: string) {
  if (!dateString || dateString.trim().toLowerCase() === "string") return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return fallback;
  const year = date.getFullYear();
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCleanValue(val: unknown): string | null {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  if (trimmed.toLowerCase() === "string" || trimmed === "") return null;
  return trimmed;
}


function getCleanValueFromUnknown(value: unknown): string | null {
  const cleanValue = getCleanValue(value);
  if (cleanValue) return cleanValue;

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      getCleanValue(record.nameEn) ||
      getCleanValue(record.nameKh) ||
      getCleanValue(record.name) ||
      getCleanValue(record.value) ||
      getCleanValue(record.label) ||
      null
    );
  }

  return null;
}

function getFirstCleanValue(
  records: Array<Record<string, unknown> | null | undefined>,
  keys: string[],
): string | null {
  for (const record of records) {
    if (!record) continue;

    for (const key of keys) {
      const value = record[key];
      const cleanValue = getCleanValueFromUnknown(value);

      if (cleanValue) return cleanValue;
    }
  }

  return null;
}

function isValidSrc(src: unknown): boolean {
  if (!src || typeof src !== "string") return false;
  const s = src.trim();
  if (s.toLowerCase() === "string" || s === "") return false;
  return (
    s.startsWith("/") ||
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("blob:")
  );
}

// Dynamic Medal Icon

function MedalIcon({ level }: { level: "gold" | "silver" | "bronze" }) {
  const medalColors = {
    gold: "text-[#D4AF37]",
    silver: "text-[#C0C0C0]",
    bronze: "text-[#CD7F32]",
  };

  return (
    <svg
      width="82"
      height="82"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${medalColors[level]} transition-colors duration-300`}
    >
      <path
        d="M21.2502 18.4701L19.6002 18.8601C19.2302 18.9501 18.9402 19.2301 18.8602 19.6001L18.5102 21.0701C18.3202 21.8701 17.3002 22.1201 16.7702 21.4901L13.7802 18.0501C13.5402 17.7701 13.6702 17.3301 14.0302 17.2401C15.8002 16.8101 17.3902 15.8201 18.5602 14.4101C18.7502 14.1801 19.0902 14.1501 19.3002 14.3601L21.5202 16.5801C22.2802 17.3401 22.0102 18.2901 21.2502 18.4701Z"
        fill="currentColor"
      />
      <path
        d="M2.70016 18.4701L4.35016 18.8601C4.72016 18.9501 5.01016 19.2301 5.09016 19.6001L5.44016 21.0701C5.63016 21.8701 6.65016 22.1201 7.18016 21.4901L10.1702 18.0501C10.4102 17.7701 10.2802 17.3301 9.92016 17.2401C8.15016 16.8101 6.56016 15.8201 5.39016 14.4101C5.20016 14.1801 4.86016 14.1501 4.65016 14.3601L2.43016 16.5801C1.67016 17.3401 1.94016 18.2901 2.70016 18.4701Z"
        fill="currentColor"
      />
      <path
        d="M12 2C8.13 2 5 5.13 5 9C5 10.45 5.43 11.78 6.17 12.89C7.25 14.49 8.96 15.62 10.95 15.91C11.29 15.97 11.64 16 12 16C12.36 16 12.71 15.97 13.05 15.91C15.04 15.62 16.75 14.49 17.83 12.89C18.57 11.78 19 10.45 19 9C19 5.13 15.87 2 12 2ZM15.06 8.78L14.23 9.61C14.09 9.75 14.01 10.02 14.06 10.22L14.3 11.25C14.49 12.06 14.06 12.38 13.34 11.95L12.34 11.36C12.16 11.25 11.86 11.25 11.68 11.36L10.68 11.95C9.96 12.37 9.53 12.06 9.72 11.25L9.96 10.22C10 10.03 9.93 9.75 9.79 9.61L8.94 8.78C8.45 8.29 8.61 7.8 9.29 7.69L10.36 7.51C10.54 7.48 10.75 7.32 10.83 7.16L11.42 5.98C11.74 5.34 12.26 5.34 12.58 5.98L13.17 7.16C13.25 7.32 13.46 7.48 13.65 7.51L14.72 7.69C15.39 7.8 15.55 8.29 15.06 8.78Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Dashboard Button

function DashboardButton({ role }: { role: UserRole }) {
  const { language } = useI18n();
  const t = getProfileText(language);
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`/overview-dashboard?userRole=${role}`)}
      className="inline-flex h-12.5 w-full items-center justify-center gap-2 whitespace-nowrap
        rounded-[14px] bg-secondary px-5 text-[14px] font-bold text-primary-heading
        transition-all duration-200 hover:bg-secondary/80 active:scale-[0.98] cursor-pointer sm:w-fit"
    >
      
      <span className="whitespace-nowrap">{t("profile.rigt-btn")}</span>
      <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.5} />
    </button>
  );
}

// Message Button

function MessageButton({
  targetRole,
  targetUserId,
  targetName,
}: {
  targetRole: UserRole;
  targetUserId?: string;
  targetName: string;
}) {
  const { language } = useI18n();
  const t = getProfileText(language);
  const params = new URLSearchParams({
    new: "true",
    chatType: "DIRECT",
  });

  const canStartDirectChat =
    targetUserId && (targetRole === "farmer" || targetRole === "buyer");

  if (targetRole === "farmer" && targetUserId) {
    params.set("farmerId", targetUserId);
    params.set("farmerName", targetName);
  }

  if (targetRole === "buyer" && targetUserId) {
    params.set("buyerId", targetUserId);
    params.set("buyerName", targetName);
  }

  const href = canStartDirectChat ? `/chat?${params.toString()}` : "/chat";

return (
    <Link
      href={href}
      className="inline-flex h-12.5 w-full items-center justify-center gap-2 whitespace-nowrap
        rounded-[14px] bg-secondary px-5 text-[14px] font-bold text-primary-heading
        transition-all duration-200 hover:bg-secondary/80 active:scale-[0.98] cursor-pointer sm:w-fit"
    >
      <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      <span className="whitespace-nowrap">{t("profile.message")}</span>
    </Link>
  );
}

function ButtonSpinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden="true"
    />
  );
}

// Follow Button

function FollowButton({
  farmerId,
  initialIsFollowing,
}: {
  farmerId: string;
  initialIsFollowing: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
  const { language } = useI18n();
  const t = getProfileText(language);
useEffect(() => {
  if (!showUnfollowModal) return;

  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalOverflow;
  };
}, [showUnfollowModal]);

  useEffect(() => {
    let isMounted = true;

    const checkFollowStatus = async () => {
      try {
        setIsCheckingStatus(true);

        const result = await getFollowStatus(farmerId);

        if (isMounted) {
          setIsFollowing(result);
        }
      } catch (error) {
        // console.error("Failed to check follow status:", error);
      } finally {
        if (isMounted) {
          setIsCheckingStatus(false);
        }
      }
    };

    if (farmerId) {
      void checkFollowStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [farmerId]);

  const handleFollow = async () => {
    if (isPending || isCheckingStatus) return;

    setIsPending(true);
    setIsFollowing(true);

    try {
      const result = await followFarmer(farmerId);
      setIsFollowing(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : "";

      if (message.includes("already follow")) {
        setIsFollowing(true);
        return;
      }

      setIsFollowing(false);
      showApiError(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleUnfollow = async () => {
    if (isPending || isCheckingStatus) return;

    setIsPending(true);

    try {
      const result = await unfollowFarmer(farmerId);
      setIsFollowing(result);
      setShowUnfollowModal(false);
    } catch (error) {
      showApiError(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleClick = () => {
    if (isPending || isCheckingStatus) return;

    if (isFollowing) {
      setShowUnfollowModal(true);
      return;
    }

    void handleFollow();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || isCheckingStatus}
        aria-pressed={isFollowing}
        className={`inline-flex h-12.5 w-full items-center justify-center gap-2 whitespace-nowrap
          rounded-[14px] px-5 text-[14px] font-bold
          transition-all duration-200 active:scale-[0.98] cursor-pointer sm:w-fit
          disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100
          ${
            isFollowing
              ? "border border-primary bg-white text-primary hover:bg-primary/5"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
      >
        {isPending || isCheckingStatus ? (
          <ButtonSpinner />
        ) : isFollowing ? (
          <UserCheck className="h-4 w-4 shrink-0" strokeWidth={2.5} />
        ) : (
          <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
        )}

        <span className="whitespace-nowrap">
          {isCheckingStatus
            ? t("profile.checking")
            : isPending
              ? isFollowing
                ? t("profile.followingProgress")
                : t("profile.followingProgress")
              : isFollowing
                ? t("profile.following")
                : t("profile.follow")}
        </span>
      </button>

      {showUnfollowModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40 px-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
  >
    <div className="w-full max-w-105 overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <XCircle className="h-7 w-7 text-red-500" strokeWidth={2.4} />
      </div>

      <div className="mt-5 text-center">
        <h3 className="text-[20px] font-extrabold text-primary-heading">
          {t("profile.popupUnfollow")}
        </h3>

        <p className="mt-2 text-[14px] leading-6 text-secondary-body">
          {t("profile.description.unfollow")}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setShowUnfollowModal(false)}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-[14px]
            border border-light-grey bg-white px-4 text-[14px] font-bold
            text-secondary-body transition-all duration-200 hover:bg-gray-50
            active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {t("profile.btn-cancel")}
        </button>

        <button
          type="button"
          onClick={handleUnfollow}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px]
            bg-red-500 px-4 text-[14px] font-bold text-white
            transition-all duration-200 hover:bg-red-600 active:scale-[0.98]
            disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending && <ButtonSpinner />}
          {isPending ? "Unfollowing..." : "Unfollow"}
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}

// Edit Profile Dropdown

function EditProfileDropdown({
  role,
  profile,
}: {
  role: UserRole;
  profile: UserProfilePayload;
}) {
  const { language } = useI18n();
  const t = getProfileText(language);
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  // Determine which identifier is missing for this user
  const hasEmail = !!getCleanValue(profile?.basicInfo?.email);
  const hasPhone = !!getCleanValue(profile?.basicInfo?.phoneNumber);
  // Show "Add Email" when phone-only user, "Add Phone" when email-only user
  const missingIdentifierType: "email" | "phone" | null =
    !hasEmail && hasPhone ? "email" : !hasPhone && hasEmail ? "phone" : null;

  const router = useRouter();  

  const openForm = (form: ActiveForm) => {
    setActiveForm(form);
    setIsOpen(false);
  };

  useDismissibleDropdown({
    open: isOpen,
    containerRef: dropdownRef,
    onClose: closeDropdown,
  });

  return (
    <>
      <div ref={dropdownRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex h-12.5 w-full items-center justify-center gap-2 whitespace-nowrap
            rounded-[14px] bg-primary px-5 text-[14px] font-bold text-white
            transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] cursor-pointer sm:w-fit"
        >
          <PencilLine className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{t("profile.left-btn")}</span>
        </button>

        <div
          className={`absolute right-0 top-13.5 z-50 w-60 overflow-hidden rounded-[18px]
            border border-[#E8E8E8] bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.10)]
            transition-all duration-200 origin-top-right
            ${isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
        >
          {(
            [
              {
                form: "personal" as const,
                icon: UserPen,
                label: t("profile.edit-personalInfo"),
              },
              {
                form: "password" as const,
                icon: KeyRound,
                label: t("profile.edit-password"),
              },
              {
                form: "bakong" as const,
                icon: Banknote,
                label: t("profile.edit-bakong"),
              },
              ...(missingIdentifierType
                ? [
                    {
                      form: "add-identifier" as const,
                      icon: missingIdentifierType === "email" ? Mail : Phone,
                      label:
                        missingIdentifierType === "email"
                          ? t("profile.edit-email")
                          : t("Profile.edit.phone"),
                    },
                  ]
                : []),
            ] satisfies { form: ActiveForm; icon: LucideIcon; label: string }[]
          ).map(({ form, icon: Icon, label }) => (
            <button
              key={form}
              type="button"
              onClick={() => openForm(form)}
              className="flex h-11.5 w-full items-center gap-3 rounded-3xl px-3 text-left
                text-[14px] font-semibold text-primary-heading
                transition-colors duration-150 hover:bg-primary/10 cursor-pointer"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeForm === "personal" && (
        <PersonalInformation
          role={role}
          profile={profile}
          onClose={() => setActiveForm(null)}
        />
      )}
      {activeForm === "password" && (
        <UpdatePassword onClose={() => setActiveForm(null)} />
      )}
      {activeForm === "bakong" && (
        <BakongAccount onClose={() => setActiveForm(null)} />
      )}
      {activeForm === "add-identifier" && missingIdentifierType && (
        <AddLoginIdentifier
          missingType={missingIdentifierType}
          onClose={() => setActiveForm(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}

// Profile Header

type ProfileHeaderProps = {
  role: UserRole;
  profile: UserProfilePayload | null;
  readOnly?: boolean;
  initialIsFollowing?: boolean;
  viewerRole?: UserRole | null;
};

export default function ProfileHeader({
  role,
  profile,
  readOnly = false,
  initialIsFollowing = false,
  viewerRole = null,
}: ProfileHeaderProps) {
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const fallbackText = t("profile.fallback.na");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [overrideImage, setOverrideImage] = useState<
    Record<UserRole, string | null>
  >({ farmer: null, buyer: null, government: null });
  const [imageToastMsg, setImageToastMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      Object.values(overrideImage).forEach((url) => {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [overrideImage]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      setImageToastMsg(t("profile.image.invalidType"));
      setTimeout(() => setImageToastMsg(null), 3000);
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setOverrideImage((prev) => ({ ...prev, [role]: objectUrl }));
    event.target.value = "";
  };

  const basicInfo = profile?.basicInfo;
  const personalInfo = profile?.personalInfo;
  const basicInfoRecord = (basicInfo ?? {}) as Record<string, unknown>;
  const personalInfoRecord = (personalInfo ?? {}) as Record<string, unknown>;
  const profileRecord = (profile ?? {}) as unknown as Record<string, unknown>;

  const fullNameCandidate = getFirstCleanValue(
    [personalInfoRecord, basicInfoRecord, profileRecord],
    [
      "fullName",
      "full_name",
      "fullNameEn",
      "farmerName",
      "farmerFullName",
      "farmer_full_name",
      "governmentName",
      "userName",
      "displayName",
      "name",
    ],
  );

  const idFallback =
    getCleanValue(basicInfo?.userId) || getCleanValue(personalInfo?.buyerProfileId) || null;

  const fullName = fullNameCandidate || idFallback || fallbackText;
  const phoneNumber = formatCambodiaPhone(getFirstCleanValue([basicInfoRecord, profileRecord], ["phoneNumber", "phone"])) || fallbackText;
  const email = getFirstCleanValue([basicInfoRecord, profileRecord], ["email"]) || fallbackText;
  const description = getFirstCleanValue([basicInfoRecord, personalInfoRecord, profileRecord], ["bio", "description"]) || t("profile.bio.empty");
  const dateOfBirth = formatDisplayDate(
    getFirstCleanValue([personalInfoRecord, basicInfoRecord, profileRecord], [
      "dateOfBirth",
      "dob",
      "birthDate",
    ]),
    fallbackText,
  );
  // A freshly-picked image is a blob: preview (passes through getFileUrl untouched);
  // a stored profileUrl is a bare filename that getFileUrl resolves against the S3 base.
  // Empty / "string" placeholder resolves to "" → show the no-profile fallback.
  const rawImage = overrideImage[role] ?? basicInfo?.profileUrl;
  const activeImage = getFileUrl(rawImage) || NO_PROFILE_IMAGE;
  const farmName = getFirstCleanValue([personalInfoRecord, profileRecord], ["farmName"]);
  const businessName = getFirstCleanValue([personalInfoRecord, profileRecord], ["businessName", "companyName"]);
  const businessType = getFirstCleanValue([personalInfoRecord, profileRecord], ["businessType"]);
  const ministryName =
    getFirstCleanValue([personalInfoRecord, basicInfoRecord, profileRecord], [
      "ministryName",
      "ministry",
      "institutionName",
    ]) || fallbackText;
  const governmentAddress = getFirstCleanValue(
    [personalInfoRecord, basicInfoRecord, profileRecord],
    ["address", "governmentAddress", "governmentLocation", "addressLocation", "fullAddress", "location"],
  );

  const isVerified =
    basicInfo?.isVerifiedIdentity === true ||
    String(basicInfo?.isVerifiedIdentity).toLowerCase() === "true";

  const titleTop =
    role === "buyer"
      ? businessName || fullName
      : role === "government"
        ? ministryName
        : farmName || fullName;

  const titleBottom = role === "buyer" ? businessType || "" : "";

  const roleLocation =
    role === "government"
      ? governmentAddress
      : role === "buyer"
        ? getFirstCleanValue([personalInfoRecord], ["placeOfBirth", "businessAddress", "businessLocation"])
        : getFirstCleanValue([personalInfoRecord], ["farmLocation", "placeOfBirth"]);

  const roleLabel =
    role === "farmer"
      ? t("profile.farmer")
      : role === "buyer"
        ? t("profile.role.buyer")
        : t("profile.role.government");
  const roleText = `${roleLabel}${roleLocation ? ` • ${roleLocation}` : ""}`;
  const infoItems: InfoItem[] =
    role === "government"
      ? [
          { label: t("profile.mName"), value: ministryName, icon: User },
          { label: t("profile.phone"), value: phoneNumber, icon: Phone },
          { label: t("profile.email"), value: email, icon: Mail },
        ]
      : [
          {
            label: role === "buyer" ? t("profile.bName") : t("profile.fname"),
            value: fullName,
            icon: User,
          },
          { label: t("prfile.dob"), value: dateOfBirth, icon: CalendarDays },
          { label: t("profile.phone"), value: phoneNumber, icon: Phone },
          { label: t("profile.email"), value: email, icon: Mail },
          ...(role === "farmer"
            ? [
                {
                  label: t("profile.farm"),
                  value:
                    personalInfo?.farmSize &&
                    String(personalInfo.farmSize).toLowerCase() !== "string"
                      ? `${personalInfo.farmSize} ${t("profile.unit.hectares")}`
                      : fallbackText,
                  icon: Grid2x2Check,
                },
              ]
            : [
                {
                  label: t("profile.busType"),
                  value: businessType || fallbackText,
                  icon: BriefcaseBusiness,
                },
              ]),
        ];

  // Dynamic numeric score parsing
  const scoreValue = personalInfo?.trustScore !== undefined && String(personalInfo.trustScore).toLowerCase() !== "string"
    ? parseFloat(String(personalInfo.trustScore))
    : 0;

  // SCALING BALANCED TO A MAX 5.0 HIGHEST SCORE RANGE:
  let assignedLevel: "gold" | "silver" | "bronze" = "bronze";
  if (scoreValue >= 4.0) {
    assignedLevel = "gold"; 
  } else if (scoreValue >= 2.5) {
    assignedLevel = "silver"; 
  } else {
    assignedLevel = "bronze"; 
  }

  const themeStyles = {
    gold: { text: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
    silver: { text: "text-slate-500", bg: "bg-slate-500/10" },
    bronze: { text: "text-[#CD7F32]", bg: "bg-[#CD7F32]/10" },
  };

  const currentTheme = themeStyles[assignedLevel];
  const trust = {
    show: role === "farmer",
    score: scoreValue.toFixed(2),
    label: getCleanValue(personalInfo?.trustLevel) || t(`profile.trust.${assignedLevel}`),
    level: assignedLevel,
  };

  return (
    <section className={`relative w-full rounded-[28px] bg-white px-5 py-6 lg:px-8 xl:px-10 ${fontClass}`}>
      {imageToastMsg && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-red-500 px-4 py-3 text-xs font-bold text-white
          shadow-lg animate-bounce">
          {imageToastMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,auto)]">
        {/* ── Left column: avatar + identity ── */}
        <div className="grid min-w-0 items-center gap-5 lg:grid-cols-[185px_minmax(0,1fr)]">
          <div className="flex justify-center lg:justify-start">
            <div className="relative h-42.5 w-42.5 shrink-0 lg:h-46.25 lg:w-46.25">
              <Image
                src={activeImage}
                alt={`${role} profile`}
                width={185}
                height={185}
                sizes="(max-width: 1024px) 170px, 185px"
                className="h-full w-full rounded-full border-[6px] border-[#f7f2e7] object-cover shadow-sm
                  transition-opacity duration-300"
                onError={(event) => {
                  event.currentTarget.src = NO_PROFILE_IMAGE;
                }}
              />
              {!readOnly && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
                  onChange={handleImageChange}
                  className="hidden"
                />
              )}
            </div>
          </div>

          <div className="min-w-0 text-center lg:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-muted">
              {roleText}
            </p>

            <div className="mt-2">
              <div className="flex max-w-190 flex-wrap items-center justify-center text-3xl font-bold gap-x-3 gap-y-2 lg:justify-start">
                  {titleTop}
                

                {isVerified ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                    <Verified className="h-4 w-4 shrink-0 text-blue-500" />
                    {t("profile.verified")}
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    {t("profile.unverified")}
                  </span>
                )}
              </div>

              {titleBottom && (
                <div className="mt-2 flex items-center justify-center gap-2 text-[16px] font-semibold text-muted lg:justify-start">
                  <span>{titleBottom}</span>
                </div>
              )}
            </div>

            <p className="mt-5 max-w-155 text-[14px] leading-normal text-secondary-body">
              {description}
            </p>
          </div>
        </div>

        {/* ── Right column: actions + trust score ── */}
        <div className="flex flex-col justify-between gap-6">
          {!readOnly && profile && (
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center xl:justify-end">
              <EditProfileDropdown role={role} profile={profile} />
              <DashboardButton role={role} />
            </div>
          )}

          {readOnly && profile && viewerRole !== "farmer" && role !== "government" && role !== "buyer" &&(
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center xl:justify-end">
              <MessageButton
                targetRole={role}
                targetUserId={basicInfo?.userId}
                targetName={titleTop}
              />
              {role === "farmer" && basicInfo?.userId && (
                <FollowButton
                  farmerId={basicInfo.userId}
                  initialIsFollowing={initialIsFollowing}
                />
              )}
            </div>
          )}

          {trust.show && (
            <div className="flex w-full items-center justify-center gap-5
              border-t border-light-grey pt-4
              xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
              <div className="text-center">
                <p className="text-[12px] font-semibold uppercase tracking-[2px] text-muted">
                  {t("profile.score")}
                </p>
                <h2 className={`mt-1 text-[52px] font-bold leading-none ${currentTheme.text}`}>
                  {trust.score}
                </h2>
                <span className={`mt-2 inline-block rounded-full px-3 py-1
                  text-[10px] font-bold uppercase tracking-[1px] ${currentTheme.text} ${currentTheme.bg}`}>
                  {trust.label}
                </span>
              </div>
              <MedalIcon level={trust.level} />
            </div>
          )}
        </div>
      </div>

      {/* ── Info grid ── */}
      <div
        className={`mt-10 grid grid-cols-1 gap-y-6 border-t border-light-grey pt-6
          sm:grid-cols-2 lg:grid-cols-3 ${role === "government" ? "xl:grid-cols-3" : "xl:grid-cols-5"}`}
      >
        {infoItems.map((item, index) => {
          const Icon = item.icon;
          const isMissingIdentifier =
            !readOnly &&
            ((item.label === t("profile.phone") && item.value === fallbackText) ||
              (item.label === t("profile.email") && item.value === fallbackText));
          return (
            <div
              key={item.label}
              className={`flex flex-col items-center px-3 text-center
                xl:border-r xl:border-light-grey
                ${index === infoItems.length - 1 ? "xl:border-r-0" : ""}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10
                transition-transform duration-200 hover:scale-110">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[1.5px] text-muted">
                {item.label}
              </p>
              {isMissingIdentifier ? (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-dashed border-orange-300 bg-orange-50 px-2.5 py-0.75 text-[11px] font-semibold text-orange-500">
                  {t("profile.not-add")}
                </span>
              ) : (
                <p className="mt-2 text-[14px] font-bold text-primary-heading">
                  {item.value}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
