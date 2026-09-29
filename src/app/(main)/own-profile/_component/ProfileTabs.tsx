"use client";

/**
 * profile-tabs.tsx
 *
 * Tab navigation for the profile page. Only one "use client" declaration
 * needed here for the active-tab state. All tab content components are
 * passed in as ReactNode props from the server-rendered parent.
 */

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Bookmark,
  ClipboardCheck,
  ClipboardList,
  Star,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "./ProfileHeader";
import { useI18n } from "@/lib/i18n/I18nContext";

const PROFILE_TEXT = {
  "profile.body.fourth-tab": { en: "Rating", kh: "ការវាយតម្លៃ" },
  "profile.body.second-tab": { en: "Saved Demand Post", kh: "ប្រកាសតម្រូវការដែលបានរក្សាទុក" },
  "profile.body.tab": { en: "Crop Post", kh: "ប្រកាសដំណាំ" },
  "profile.body.third-tab": { en: "Order History", kh: "ប្រវត្តិការបញ្ជាទិញ" },
  "profile.tab.demand-post": { en: "Demand Post", kh: "ប្រកាសតម្រូវការ" },
  "profile.tab.save-crop": { en: "Saved Crop Post", kh: "ប្រកាសដំណាំដែលបានរក្សាទុក" },
} as const;

function getProfileText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PROFILE_TEXT[key as keyof typeof PROFILE_TEXT]?.[lang] ?? key;
}


// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey =
  | "crop-post"
  | "saved-demand-post"
  | "demand-post"
  | "saved-crop-post"
  | "order-history"
  | "rating";

type TabItem = {
  label: string;
  tabKey: TabKey;
  icon: LucideIcon;
};

type ProfileTabsProps = {
  role: UserRole;
  readOnly?: boolean;
  cropPostComponent?: ReactNode;
  savedDemandPostComponent?: ReactNode;
  demandPostComponent?: ReactNode;
  savedCropPostComponent?: ReactNode;
  orderHistoryComponent?: ReactNode;
  ratingComponent?: ReactNode;
};

const defaultTabByRole: Record<UserRole, TabKey> = {
  buyer: "demand-post",
  farmer: "crop-post",
  government: "demand-post",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileTabs({
  role,
  readOnly = false,
  cropPostComponent,
  savedDemandPostComponent,
  demandPostComponent,
  savedCropPostComponent,
  orderHistoryComponent,
  ratingComponent,
}: ProfileTabsProps) {
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const tabs = useMemo(() => {
    const tabsByRole: Record<UserRole, TabItem[]> = {
      government: [
        { label: t("profile.tab.demand-post"), tabKey: "demand-post", icon: ClipboardList },
        { label: t("profile.tab.save-crop"), tabKey: "saved-crop-post", icon: Bookmark },
        { label: t("profile.body.third-tab"), tabKey: "order-history", icon: ClipboardCheck },
        { label: t("profile.body.fourth-tab"), tabKey: "rating", icon: Star },
      ],
      buyer: [
        { label: t("profile.tab.demand-post"), tabKey: "demand-post", icon: ClipboardList },
        { label: t("profile.tab.save-crop"), tabKey: "saved-crop-post", icon: Bookmark },
        { label: t("profile.body.third-tab"), tabKey: "order-history", icon: ClipboardCheck },
        { label: t("profile.body.fourth-tab"), tabKey: "rating", icon: Star },
      ],
      farmer: [
        { label: t("profile.body.tab"), tabKey: "crop-post", icon: ClipboardList },
        { label: t("profile.body.second-tab"), tabKey: "saved-demand-post", icon: Bookmark },
        { label: t("profile.body.third-tab"), tabKey: "order-history", icon: ClipboardCheck },
        { label: t("profile.body.fourth-tab"), tabKey: "rating", icon: Star },
      ],
    };

    return readOnly
      ? tabsByRole[role].filter(
          (tab) =>
            tab.tabKey === "crop-post" ||
            tab.tabKey === "demand-post" ||
            tab.tabKey === "rating",
        )
      : tabsByRole[role];
  }, [readOnly, role, t]); // Re-run if role or translation function changes

  const [activeTab, setActiveTab] = useState<TabKey>(defaultTabByRole[role]);

  const contentByTab = useMemo<Record<TabKey, ReactNode>>(
    () => ({
      "crop-post": cropPostComponent,
      "saved-demand-post": savedDemandPostComponent,
      "demand-post": demandPostComponent,
      "saved-crop-post": savedCropPostComponent,
      "order-history": orderHistoryComponent,
      rating: ratingComponent,
    }),
    [
      cropPostComponent,
      savedDemandPostComponent,
      demandPostComponent,
      savedCropPostComponent,
      orderHistoryComponent,
      ratingComponent,
    ],
  );

  return (
    <div className={`mt-1 flex w-full justify-center ${fontClass}`}>
      <section className="w-full rounded-[28px] bg-white px-5 pb-8 pt-8 md:px-10 lg:px-25 lg:pb-10 lg:pt-10">
        {/* Tab navigation */}
        <nav className="mx-auto h-13.75 w-full max-w-332 border-b border-light-grey">
          <div className="flex h-full items-center gap-8 overflow-x-auto lg:gap-15">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.tabKey;

              return (
                <button
                  key={tab.tabKey}
                  type="button"
                  onClick={() => setActiveTab(tab.tabKey)}
                  className={`relative flex cursor-pointer h-full shrink-0 items-center gap-2 whitespace-nowrap
                    transition-colors duration-150
                    ${isActive
                      ? "text-primary"
                      : "text-secondary-body hover:text-primary"
                    }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2.2} />
                  <span className="text-[16px] font-semibold leading-none sm:text-[18px]">
                    {tab.label}
                  </span>

                  {/* Active indicator bar */}
                  <span
                    className={`absolute bottom-0 left-0 h-0.75 rounded-full bg-primary
                      transition-all duration-300
                      ${isActive ? "w-full opacity-100" : "w-0 opacity-0"}`}
                  />
                </button>
              );
            })}
          </div>
        </nav>

        {/* Tab content — fade transition on switch */}
        <div
          key={activeTab}
          className="mx-auto w-full max-w-332 pt-4 animate-in fade-in duration-200"
        >
          {contentByTab[activeTab] ?? null}
        </div>
      </section>
    </div>
  );
}