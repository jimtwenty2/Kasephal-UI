"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { UserRole } from "@/types/user-role";
import LanguageButton from "./LanguageButton";
import ProfileButton from "./ProfileButton";
import { useRouter, usePathname } from "next/navigation";
import NotificationButtonComponent from "../action-components/NotificationButtonComponent";
import ChatButtonNavbar from "./ChatButtonNavbar";
import { useSession, signOut } from "next-auth/react";
import {
  getCurrentUserProfileService,
  searchFarmersService,
  type FarmerSearchResult,
} from "@/services/profile.service";
import { logoutService } from "@/services/auth/auth.service";
import { getFileUrl } from "@/utils/getFileUrl";
import {
  PROFILE_IMAGE_UPDATED_EVENT,
  type ProfileImageUpdatedDetail,
} from "@/lib/profileImageEvent";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { clearAuthSessionMarker } from "@/lib/authSessionMarker";

const DEFAULT_PROFILE_IMAGE = "/assets/no-profile.jpg";
const FARMER_SEARCH_DEBOUNCE_MS = 300;
const MIN_FARMER_SEARCH_LENGTH = 2;
import {
  Gauge,
  Loader2,
  LogOut,
  MapPin,
  ScrollText,
  Search,
  UserRound,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import LogoutConfirmModal from "../action-components/LogoutConfirmModal";
import { useI18n } from "@/lib/i18n/I18nContext";

const NAV_TEXT = {
  "nav.home": { en: "Home", kh: "ទំព័រដើម" },
  "nav.cropProducts": { en: "Crop Products", kh: "ផលិតផលកសិកម្ម" },
  "nav.cropDemands": { en: "Crop Demands", kh: "តម្រូវការកសិផល" },
  "nav.marketPrice": { en: "Market Price", kh: "តម្លៃទីផ្សារ" },
  "nav.searchFarmers": { en: "Search farmers", kh: "ស្វែងរកកសិករ" },
  "nav.login": { en: "Login", kh: "ចូលគណនី" },
  "nav.menu": { en: "Menu", kh: "ម៉ឺនុយ" },
  "nav.account": { en: "Account", kh: "គណនី" },
  "nav.viewProfile": { en: "View Profile", kh: "មើលប្រវត្តិរូប" },
  "nav.orderHistory": { en: "Order History", kh: "ប្រវត្តិការបញ្ជាទិញ" },
  "nav.dashboard": { en: "Dashboard", kh: "ផ្ទាំងគ្រប់គ្រង" },
  "nav.overviewDashboard": {
    en: "Overview Dashboard",
    kh: "ផ្ទាំងគ្រប់គ្រងទូទៅ",
  },
  "nav.logout": { en: "Logout", kh: "ចាកចេញ" },
  "nav.current": { en: "Current", kh: "បច្ចុប្បន្ន" },
  "nav.searchLoading": {
    en: "Searching farmers...",
    kh: "កំពុងស្វែងរកកសិករ...",
  },
  "nav.searchMinChars": {
    en: "Type at least 2 characters to search farmers",
    kh: "សូមវាយយ៉ាងតិច ២ អក្សរដើម្បីស្វែងរកកសិករ",
  },
  "nav.searchNoResults": { en: "No farmers found", kh: "រកមិនឃើញកសិករទេ" },
} as const;

function getNavText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  return (key: keyof typeof NAV_TEXT) => NAV_TEXT[key][lang];
}

type NavbarProps = {
  role?: UserRole | null;
};

export default function Navbar({ role }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [farmerSearchOpen, setFarmerSearchOpen] = useState(false);
  const [farmerSearchQuery, setFarmerSearchQuery] = useState("");
  const [farmerSearchResults, setFarmerSearchResults] = useState<
    FarmerSearchResult[]
  >([]);
  const [farmerSearchLoading, setFarmerSearchLoading] = useState(false);

  const { language, setLanguage } = useI18n();
  const t = getNavText(language);

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);

  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const farmerSearchRef = useRef<HTMLDivElement>(null);
  const farmerSearchInputRef = useRef<HTMLInputElement>(null);

  const isLogin = status === "authenticated";

  const roleParam = (
    (role ?? session?.user?.role ?? "farmer") as string
  ).toLowerCase();
  const canSearchFarmers = roleParam === "buyer" || roleParam === "government";
  const profilePath = `/own-profile?role=${roleParam}`;
  const dashboardPath = "/overview-dashboard";
  const isProfilePath = pathname.startsWith("/own-profile");
  const isOrderHistoryPath = pathname.startsWith("/order-history");
  const isDashboardPath = pathname === dashboardPath;
  // Routes that render their own full-bleed hero using navbar_bg_image.png
  // pulled up beneath the navbar. On these the navbar must stay transparent
  // so its background doesn't double up over the hero.
  const HERO_BACKGROUND_ROUTES = [
    "/",
    "/listing-product",
    "/listing-crop-demands",
    "/market-price",
    "/own-profile",
    "/crop-product-management",
    "/crop-demands-management",
  ];
  const hasHeroBackground = HERO_BACKGROUND_ROUTES.includes(pathname);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfileService();
      const resolvedImage = getFileUrl(profile?.basicInfo?.profileUrl);
      setProfileImage(resolvedImage || DEFAULT_PROFILE_IMAGE);
    } catch {
      // keep defaults on error
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    const timeoutId = window.setTimeout(() => {
      void fetchProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [status, fetchProfile]);
  useEffect(() => {
    function handleProfileImageUpdated(event: Event) {
      const detail = (event as CustomEvent<ProfileImageUpdatedDetail>).detail;
      const resolvedImage = getFileUrl(detail?.profileUrl);

      if (resolvedImage) {
        setProfileImage(resolvedImage);
      } else {
        setProfileImage(DEFAULT_PROFILE_IMAGE);
        fetchProfile();
      }
    }

    window.addEventListener(
      PROFILE_IMAGE_UPDATED_EVENT,
      handleProfileImageUpdated,
    );
    return () =>
      window.removeEventListener(
        PROFILE_IMAGE_UPDATED_EVENT,
        handleProfileImageUpdated,
      );
  }, [fetchProfile]);

  const closeProfileDropdown = useCallback(() => setProfileOpen(false), []);

  useDismissibleDropdown({
    open: profileOpen,
    containerRef: profileRef,
    onClose: closeProfileDropdown,
  });

  const closeFarmerSearch = useCallback(() => setFarmerSearchOpen(false), []);

  useDismissibleDropdown({
    open: farmerSearchOpen,
    containerRef: farmerSearchRef,
    onClose: closeFarmerSearch,
  });

  useEffect(() => {
    if (!farmerSearchOpen) return;

    const timeoutId = window.setTimeout(() => {
      farmerSearchInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [farmerSearchOpen]);

  useEffect(() => {
    if (!farmerSearchOpen) return;

    const query = farmerSearchQuery.trim();

    if (query.length < MIN_FARMER_SEARCH_LENGTH) return;

    let active = true;

    const timeoutId = window.setTimeout(() => {
      searchFarmersService(query).then((results) => {
        if (!active) return;

        setFarmerSearchResults(results.slice(0, 5));
        setFarmerSearchLoading(false);
      });
    }, FARMER_SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [farmerSearchOpen, farmerSearchQuery]);

  if (status === "loading") return null;

  async function handleLogout() {
    setProfileOpen(false);
    setIsOpen(false);
    setIsLoggingOut(true);

    try {
      const accessToken = session?.user?.accessToken;

      if (accessToken) {
        const result = await logoutService(accessToken);

        if (!result.success) {

        }
      }

      await signOut({ redirect: false });
      clearAuthSessionMarker();
      setLogoutOpen(false);
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleLanguageSwitch() {
    setLanguage(language === "en" ? "kh" : "en");
  }

  function handleProfileDropdown() {
    setFarmerSearchOpen(false);
    setProfileOpen((prev) => !prev);
  }

  function handleFarmerSearchFocus() {
    setProfileOpen(false);
    setFarmerSearchOpen(true);
  }

  function handleFarmerSearchChange(value: string) {
    setFarmerSearchQuery(value);
    setProfileOpen(false);
    setFarmerSearchOpen(true);

    if (value.trim().length < MIN_FARMER_SEARCH_LENGTH) {
      setFarmerSearchResults([]);
      setFarmerSearchLoading(false);
      return;
    }

    setFarmerSearchLoading(true);
  }

  function handleFarmerSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Escape") {
      setFarmerSearchOpen(false);
      farmerSearchInputRef.current?.blur();
      return;
    }

    if (event.key !== "Enter") return;

    const firstResult = farmerSearchResults[0];
    if (!firstResult) return;

    event.preventDefault();
    handleFarmerResultClick(firstResult.farmerId);
  }

  function handleFarmerResultClick(farmerId: string) {
    setFarmerSearchOpen(false);
    setFarmerSearchQuery("");
    setFarmerSearchResults([]);
    setIsOpen(false);
    router.push(`/other-profile/farmer/${farmerId}`);
  }

  const desktopLinkClass = (path: string) =>
    `flex h-10 items-center whitespace-nowrap leading-none cursor-pointer transition ${pathname === path ? "text-yellow-400" : "hover:text-yellow-400"
    }`;

  const mobileLinkClass = (path: string) =>
    `block rounded-xl px-4 py-3 transition text-[14px] ${pathname === path
      ? "bg-emerald-50 text-emerald-700 font-semibold"
      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const profileMenuItemClass = (isActive: boolean, mobile = false) =>
    `group flex w-full items-center justify-between gap-3 ${mobile ? "rounded-2xl" : "rounded-xl"
    } px-3.5 py-3 text-left text-sm transition-all duration-200 ${isActive
      ? "cursor-default bg-secondary text-primary-heading shadow-sm ring-1 ring-yellow-300/70"
      : "text-gray-700 hover:bg-emerald-50 hover:text-primary hover:translate-x-0.5"
    }`;

  const profileMenuIconClass = (isActive: boolean) =>
    `flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${isActive
      ? "bg-white/80 text-primary-heading"
      : "bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary"
    }`;

  const renderProfileMenuItem = ({
    href,
    label,
    isActive,
    icon,
    mobile = false,
    onNavigate,
  }: {
    href: string;
    label: string;
    isActive: boolean;
    icon: ReactNode;
    mobile?: boolean;
    onNavigate: () => void;
  }) => {
    const content = (
      <>
        <span className="flex min-w-0 items-center gap-3">
          <span className={profileMenuIconClass(isActive)}>{icon}</span>
          <span className="truncate font-semibold">{label}</span>
        </span>
        {isActive && (
          <span className=" rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-heading">
            {t("nav.current")}
          </span>
        )}
      </>
    );

    if (isActive) {
      return (
        <motion.button
          type="button"
          disabled
          aria-current="page"
          className={profileMenuItemClass(true, mobile)}
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
      >
        <Link
          href={href}
          onClick={onNavigate}
          className={profileMenuItemClass(false, mobile)}
        >
          {content}
        </Link>
      </motion.div>
    );
  };

  const renderFarmerSearchPopup = (align: "left" | "right" = "left") => (
    <AnimatePresence>
      {farmerSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className={`absolute top-12 z-50 min-h-36 w-[min(400px,calc(100vw-2rem))] rounded-[18px] border border-gray-100 bg-white p-3 shadow-2xl shadow-black/10 ${align === "right" ? "right-0" : "left-0"
            }`}
        >
          <div className="flex min-h-[112px] max-h-[360px] flex-col overflow-y-auto">
            {farmerSearchLoading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-[15px] text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("nav.searchLoading")}
              </div>
            ) : farmerSearchQuery.trim().length < MIN_FARMER_SEARCH_LENGTH ? (
              <div className="flex flex-1 items-center justify-center px-4 text-center text-[14px] font-medium text-gray-500">
                {t("nav.searchMinChars")}
              </div>
            ) : farmerSearchQuery.trim().length >= MIN_FARMER_SEARCH_LENGTH &&
              farmerSearchResults.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-center text-[15px] font-medium text-gray-500">
                {t("nav.searchNoResults")}
              </div>
            ) : (
              <div className="space-y-1">
                {farmerSearchResults.slice(0, 5).map((farmer) => {
                  const imageUrl =
                    getFileUrl(farmer.farmerUrl) || DEFAULT_PROFILE_IMAGE;

                  return (
                    <button
                      key={farmer.farmerId}
                      type="button"
                      onClick={() => handleFarmerResultClick(farmer.farmerId)}
                      className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-emerald-50"
                    >
                      <Image
                        src={imageUrl}
                        alt={farmer.farmerName}
                        width={42}
                        height={42}
                        sizes="42px"
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-primary-heading">
                          {farmer.farmerName}
                        </span>
                        <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {farmer.farmLocation}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="relative z-50">
        <div className="mt-8 w-full px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto h-16 w-full rounded-[20px] md:h-20 md:rounded-[25px]">
            {!hasHeroBackground && (
              <div className="absolute inset-0 overflow-hidden rounded-[20px] md:rounded-[25px]">
                {/* <Image
                  src="/assets/nav-bar/navbar_bg_image.png"
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                /> */}
              </div>
            )}
            <div className="relative z-10 flex h-full w-full items-center justify-between mt-5 px-4 sm:px-8 lg:px-20">
              <Link href="/">
                <Image
                  src="/assets/nav-bar/Logo.png"
                  alt="Logo"
                  width={90}
                  height={75}
                  className="object-contain cursor-pointer"
                />
              </Link>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center gap-10">
                <ul className="flex items-center gap-8 font-medium xl:gap-16 text-white text-[18px]">
                  <li className={desktopLinkClass("/")}>
                    <Link href="/">{t("nav.home")}</Link>
                  </li>
                  <li className={desktopLinkClass("/listing-product")}>
                    <Link href="/listing-product">
                      {t("nav.cropProducts")}
                    </Link>
                  </li>
                  <li className={desktopLinkClass("/listing-crop-demands")}>
                    <Link href="/listing-crop-demands">
                      {t("nav.cropDemands")}
                    </Link>
                  </li>
                  <li className={desktopLinkClass("/market-price")}>
                    <Link href="/market-price">{t("nav.marketPrice")}</Link>
                  </li>
                  {canSearchFarmers && (
                    <li>
                      <div ref={farmerSearchRef} className="relative">
                        <div className="flex h-10 w-58 items-center gap-2 rounded-xl border border-white/30 bg-white/95 px-3 text-primary-heading shadow-sm transition focus-within:border-yellow-300 focus-within:ring-2 focus-within:ring-yellow-300/25">
                          <Search className="h-4 w-4 shrink-0 text-gray-400" />
                          <input
                            ref={farmerSearchInputRef}
                            value={farmerSearchQuery}
                            onFocus={handleFarmerSearchFocus}
                            onChange={(event) =>
                              handleFarmerSearchChange(event.target.value)
                            }
                            onKeyDown={handleFarmerSearchKeyDown}
                            placeholder={t("nav.searchFarmers")}
                            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
                          />
                        </div>
                        {renderFarmerSearchPopup()}
                      </div>
                    </li>
                  )}
                </ul>

                <div className="flex items-center gap-3">
                  <LanguageButton
                    language={language}
                    onSwitch={handleLanguageSwitch}
                  />

                  {!isLogin ? (
                    <Link href="/login">
                      <button className="h-10 whitespace-nowrap bg-white text-[14px] text-emerald-700 rounded-xl px-4 font-semibold hover:bg-gray-100 transition">
                        {t("nav.login")}
                      </button>
                    </Link>
                  ) : (
                    <>
                      <NotificationButtonComponent />
                      <Link href="/chat">
                        <ChatButtonNavbar />
                      </Link>
                      <div ref={profileRef} className="relative">
                        <ProfileButton
                          profileImage={profileImage}
                          role={role ?? (session?.user?.role as UserRole)}
                          profileOpen={profileOpen}
                          onToggle={handleProfileDropdown}
                        />
                        <AnimatePresence>
                          {profileOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.97 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                              className="absolute right-0 top-16 z-50 w-64 origin-top-right rounded-2xl border border-gray-100 bg-white p-2.5 shadow-2xl shadow-black/10"
                            >
                              <div className="mb-1 px-3 py-2">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                  {t("nav.account")}
                                </p>
                              </div>
                              {renderProfileMenuItem({
                                href: profilePath,
                                label: t("nav.viewProfile"),
                                isActive: isProfilePath,
                                icon: <UserRound className="h-4 w-4" />,
                                onNavigate: () => setProfileOpen(false),
                              })}
                              {renderProfileMenuItem({
                                href: "/order-history",
                                label: t("nav.orderHistory"),
                                isActive: isOrderHistoryPath,
                                icon: <ScrollText className="h-4 w-4" />,
                                onNavigate: () => setProfileOpen(false),
                              })}
                              {renderProfileMenuItem({
                                href: dashboardPath,
                                label: t("nav.dashboard"),
                                isActive: isDashboardPath,
                                icon: <Gauge className="h-4 w-4" />,
                                onNavigate: () => setProfileOpen(false),
                              })}
                              <div className="my-1 border-t border-gray-100" />
                              <button
                                onClick={() => {
                                  setProfileOpen(false);
                                  setLogoutOpen(true);
                                }}
                                className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 hover:translate-x-0.5"
                              >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 transition group-hover:bg-white">
                                  <LogOut className="h-4 w-4" />
                                </span>
                                {t("nav.logout")}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Right */}
              <div className="flex lg:hidden items-center gap-3">
                {isLogin && (
                  <>
                    <NotificationButtonComponent />
                    <Link href="/chat">
                      <ChatButtonNavbar />
                    </Link>
                  </>
                )}
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="w-9.5 h-9.5 rounded-xl bg-white/90 flex items-center justify-center"
                  aria-label="Toggle mobile menu"
                >
                  {isOpen ? (
                    <XMarkIcon className="w-6 h-6 text-[#3A3A3A] stroke-[2.3]" />
                  ) : (
                    <Bars3Icon className="w-6 h-6 text-[#3A3A3A] stroke-[2.3]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <LogoutConfirmModal
          open={logoutOpen}
          isSubmitting={isLoggingOut}
          onClose={() => setLogoutOpen(false)}
          onConfirm={handleLogout}
        />

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              aria-label="Close menu"
            />
            <div className="absolute right-4 top-20 w-62.5 overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="p-4">
                <p className="mb-3 text-sm font-semibold text-gray-400">
                  {t("nav.menu")}
                </p>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className={mobileLinkClass("/")}
                    >
                      {t("nav.home")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/listing-product"
                      onClick={() => setIsOpen(false)}
                      className={mobileLinkClass("/listing-product")}
                    >
                      {t("nav.cropProducts")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/listing-crop-demands"
                      onClick={() => setIsOpen(false)}
                      className={mobileLinkClass("/listing-crop-demands")}
                    >
                      {t("nav.cropDemands")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/market-price"
                      onClick={() => setIsOpen(false)}
                      className={mobileLinkClass("/market-price")}
                    >
                      {t("nav.marketPrice")}
                    </Link>
                  </li>
                  {canSearchFarmers && (
                    <li>
                      <div ref={farmerSearchRef} className="relative">
                        <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10">
                          <Search className="h-4 w-4 shrink-0 text-gray-400" />
                          <input
                            ref={farmerSearchInputRef}
                            value={farmerSearchQuery}
                            onFocus={handleFarmerSearchFocus}
                            onChange={(event) =>
                              handleFarmerSearchChange(event.target.value)
                            }
                            onKeyDown={handleFarmerSearchKeyDown}
                            placeholder={t("nav.searchFarmers")}
                            className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-primary-heading outline-none placeholder:text-gray-400"
                          />
                        </div>
                        {renderFarmerSearchPopup("right")}
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-t border-gray-100 px-4 py-3">
                <LanguageButton
                  language={language}
                  onSwitch={handleLanguageSwitch}
                />
              </div>

              <div className="border-t border-gray-100 p-4">
                {!isLogin ? (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full rounded-xl bg-[#333333] py-3 text-sm font-semibold text-white hover:bg-[#444444] transition">
                      {t("nav.login")}
                    </button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {renderProfileMenuItem({
                      href: profilePath,
                      label: t("nav.viewProfile"),
                      isActive: isProfilePath,
                      icon: <UserRound className="h-4 w-4" />,
                      mobile: true,
                      onNavigate: () => setIsOpen(false),
                    })}
                    {renderProfileMenuItem({
                      href: "/order-history",
                      label: t("nav.orderHistory"),
                      isActive: isOrderHistoryPath,
                      icon: <ScrollText className="h-4 w-4" />,
                      mobile: true,
                      onNavigate: () => setIsOpen(false),
                    })}
                    {renderProfileMenuItem({
                      href: dashboardPath,
                      label: t("nav.overviewDashboard"),
                      isActive: isDashboardPath,
                      icon: <Gauge className="h-4 w-4" />,
                      mobile: true,
                      onNavigate: () => setIsOpen(false),
                    })}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setLogoutOpen(true);
                      }}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}