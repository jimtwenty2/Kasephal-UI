"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nContext";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Eye, EyeClosed } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/action/auth/login.action";
import { useTransition } from "react";
import { LoginFormData, loginSchema } from "@/schema/login.schema";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/user-role";
import { pushToast } from "@/lib/toastStore";
import { AnimatePresence, motion } from "framer-motion";
import { setAuthSessionMarker } from "@/lib/authSessionMarker";

const REGISTER_RESUME_STORAGE_KEY = "kasephal-register-resume";
export const AUTH_TEXT = {
  "login.title": { en: "Login to your account", kh: "ចូលគណនីរបស់អ្នក" },
  "login.submitting": { en: "Logging In", kh: "កំពុងចូលគណនី..." },
  "login.subtitle": {
    en: "Log in to oversee your digital crop market, from seed to sale.",
    kh: "ចូលគណនីដើម្បីគ្រប់គ្រងទីផ្សារកសិផលឌីជីថលរបស់អ្នក ចាប់ពីការដាំដុះរហូតដល់ការលក់។",
  },
  "login.emailLabel": { en: "Email or Phone Number", kh: "អ៊ីមែល ឬ លេខទូរស័ព្ទ" },
  "login.emailPlaceholder": { en: "Enter email or phone number", kh: "បញ្ចូលអ៊ីមែល ឬ លេខទូរស័ព្ទ" },
  "login.passwordLabel": { en: "Password", kh: "ពាក្យសម្ងាត់" },
  "login.passwordPlaceholder": { en: "Password", kh: "ពាក្យសម្ងាត់" },
  "login.forgotPassword": { en: "Forgot your password?", kh: "ភ្លេចពាក្យសម្ងាត់?" },
  "login.button": { en: "LOGIN", kh: "ចូលគណនី" },
  "login.noAccount": { en: "Didn't have an account?", kh: "មិនទាន់មានគណនីមែនទេ?" },
  "login.register": { en: "Register", kh: "ចុះឈ្មោះ" },
  "login.invalidCredentials": {
    en: "Invalid credentials",
    kh: "អ៊ីមែល លេខទូរស័ព្ទ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
  },
  "login.hero.bringing": { en: "Bringing", kh: "នាំយក" },
  "login.hero.cambodian": { en: "Cambodian", kh: "កសិកម្ម" },
  "login.hero.agriculture": { en: "Agriculture", kh: "កម្ពុជា" },
  "login.hero.into": { en: "into the", kh: "ឆ្ពោះទៅកាន់" },
  "login.hero.digitalAge": { en: "Digital Age", kh: "យុគសម័យឌីជីថល" },
  "login.hero.description": {
    en: "We securely connect local harvests with reliable buyers for fair and protected trade.",
    kh: "យើងភ្ជាប់ការប្រមូលផលក្នុងស្រុកជាមួយអ្នកទិញដែលអាចទុកចិត្តបាន ដើម្បីធានាការដោះដូរដោយយុត្តិធម៌ និងសុវត្ថិភាព។",
  },
  "login.footer.copyright": {
    en: "© 2026 Kasephal. All rights reserved. Built with pride in Cambodia.",
    kh: "© ២០២៦ កសិផល។ រក្សាសិទ្ធិគ្រប់យ៉ាង។ បង្កើតឡើងដោយមោទនភាពនៅកម្ពុជា។",
  },
  "login.footer.links": {
    en: "Privacy Policy | Terms of Service | Trust & Safety",
    kh: "គោលការណ៍ឯកជនភាព | លក្ខខណ្ឌនៃសេវាកម្ម | ទំនុកចិត្ត និងសុវត្ថិភាព",
  },
} as const;

// i18n.ts
export function createTranslator<
  T extends Record<string, { en: string; kh: string }>,
>(translations: T, language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  return (key: keyof T | string) => translations[key as keyof T]?.[lang] ?? key;
}

export default function LoginFlow() {
  const [showPassword, setShowPassword] = useState(false);
  const { language } = useI18n();
  const t = createTranslator(AUTH_TEXT, language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });
  const pending = isSubmitting || isPending;

  const onSubmit = (dataForm: LoginFormData) => {
    startTransition(async () => {
      const result = await loginAction(dataForm);

      if (!result.success) {
        Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
          setError(field as keyof LoginFormData, { type: "server", message });
        });
        pushToast({ title: "Login failed", message: result.error, variant: "error" });
        return;
      }

      if ("resumeProfileSetup" in result && result.resumeProfileSetup) {
        sessionStorage.setItem(
          REGISTER_RESUME_STORAGE_KEY,
          JSON.stringify({
            role: result.role.toUpperCase(),
            step: result.resumeStep,
            profileSetupToken: result.profileSetupToken,
            identifier: result.identifier,
          }),
        );
        pushToast({
          title: "Complete profile setup",
          message: "Please complete your profile before using Kasephal.",
          variant: "success",
        });
        router.push("/register");
        return;
      }

      let session;
      try {
        session = await update();
      } catch (error) {
        console.error("Failed to refresh session after login:", error);
        pushToast({
          title: "Session error",
          message: "Login succeeded, but the session could not be loaded. Please refresh and try again.",
          variant: "error",
        });
        return;
      }

      if (session) {
        setAuthSessionMarker();
        pushToast({
          title: "Welcome back",
          message: "You have signed in successfully.",
          variant: "success",
        });
        if (session.user.role === UserRole.ADMIN) {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    });
  };

  return (
    <main
      className={`min-h-screen w-full overflow-x-hidden bg-white font-medium ${fontClass} lg:h-screen lg:overflow-hidden`}
    >
      <section className="relative flex min-h-screen w-full flex-col lg:h-full lg:flex-row lg:overflow-hidden p-4 sm:p-5">
        {/* Decorative images: desktop only, avoids clutter/overlap on mobile */}
        <Image
          src="/assets/srov.png"
          width={220}
          height={253}
          alt="srov"
          className="hidden lg:block absolute right-0 top-[3%] z-10 h-auto max-h-[25%] w-[clamp(100px,10vw,210px)] object-contain opacity-50"
        />
        <Image
          src="/assets/tractor.png"
          width={300}
          height={400}
          alt="tractor"
          className="hidden lg:block absolute bottom-0 right-[3%] h-auto max-h-[30%] w-[clamp(130px,12vw,250px)] object-contain z-10"
        />
        <div className="hidden lg:block absolute right-[-8%] top-[-3%] z-7 h-[clamp(220px,20vw,360px)] w-[clamp(170px,15vw,260px)] rounded-full bg-background blur-2xl" />

        {/* Left panel — hero, desktop/tablet-landscape only */}
        <section className="relative hidden overflow-hidden rounded-[clamp(16px,1.2vw,24px)] bg-background lg:flex lg:h-full lg:w-[52%] lg:flex-col">
          <div className="relative z-20 p-5 lg:p-[clamp(20px,4.2vw,78px)]">
            <Image
              src="/assets/logo-green.png"
              width={150}
              height={60}
              alt="logo-kasephal"
              className="h-auto w-[clamp(110px,8.7vw,150px)]"
            />
            <div className="mt-[clamp(28px,3vw,60px)] max-w-[clamp(500px,38vw,650px)]">
              <div className="relative text-[clamp(34px,3.1vw,58px)] font-extrabold leading-[1.15]">
                <h1 className="text-secondary ">{t("login.hero.bringing")}</h1>
                <h1 className="text-heading-text">
                  {t("login.hero.cambodian")}{" "}
                  <span className="text-primary">{t("login.hero.agriculture")}</span>
                </h1>
                <h1 className="text-heading-text">
                  {t("login.hero.into")}{" "}
                  <span className="text-primary">{t("login.hero.digitalAge")}</span>
                </h1>
                <Image
                  src="/assets/leaf.png"
                  width={80}
                  height={65}
                  alt="leaf"
                  className="absolute right-[5%] top-[14%] h-auto w-[clamp(50px,4.6vw,90px)]"
                />
              </div>
              <p className="mt-[clamp(12px,1vw,22px)] max-w-[clamp(420px,29vw,520px)] font-description text-[clamp(13px,0.95vw,18px)] leading-[1.4] text-description-text">
                {t("login.hero.description")}
              </p>
            </div>
          </div>
          <Image
            src="/assets/srov2.png"
            width={250}
            height={380}
            alt="srov2"
            className="absolute bottom-0 left-0 z-10 h-auto max-h-[45%] w-[clamp(150px,13vw,250px)] object-contain"
          />
          <Image
            src="/assets/preview.png"
            width={900}
            height={800}
            alt="preview"
            priority
            className="absolute bottom-[-20%] right-0 z-10 h-auto max-h-[78%] w-[78%] object-contain"
          />
        </section>

        {/* Right panel — login form */}
        <section className="relative z-20 flex w-full flex-1 flex-col justify-center px-1 py-8 sm:px-8 sm:py-10 lg:h-full lg:w-[48%] lg:px-[clamp(32px,4.2vw,82px)] lg:py-10">
          {/* Small logo shown only on mobile since hero panel is hidden */}
          <Image
            src="/assets/logo-green.png"
            width={120}
            height={48}
            alt="logo-kasephal"
            className="mb-6 h-auto w-27.5 lg:hidden"
          />

          <div className="mx-auto w-full max-w-105 lg:max-w-[clamp(380px,34vw,560px)]">
            <h1 className="text-[26px] font-bold leading-tight text-heading-text sm:text-[28px] lg:text-[clamp(26px,2.35vw,42px)]">
              {t("login.title")}
            </h1>
            <p className="mt-2 text-[14px] leading-[1.45] text-description-text lg:mt-[clamp(8px,0.8vw,16px)] lg:text-[clamp(13px,1vw,18px)]">
              {t("login.subtitle")}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 w-full lg:mt-[clamp(24px,2.3vw,42px)]">
              {/* Email / Phone */}
              <div>
                <label className="text-[14px] font-bold text-primary lg:text-[clamp(13px,0.95vw,17px)]">
                  <span className="text-red-500">*</span> {t("login.emailLabel")}
                </label>
                <input
                  type="text"
                  {...register("identifier")}
                  placeholder={t("login.emailPlaceholder")}
                  disabled={pending}
                  className="mt-2 w-full rounded-xl border border-light-grey bg-transparent px-4 py-3 text-[14px] text-description-text outline-none focus:border-primary disabled:opacity-60 lg:py-[clamp(10px,0.85vw,15px)] lg:text-[clamp(13px,0.95vw,17px)]"
                />
                {errors.identifier && (
                  <p className="mt-1 text-xs text-red-500">{t(errors.identifier.message as string)}</p>
                )}
              </div>

              {/* Password */}
              <div className="mt-4 lg:mt-[clamp(16px,1.3vw,26px)]">
                <label className="text-[14px] font-bold text-primary lg:text-[clamp(13px,0.95vw,17px)]">
                  <span className="text-red-500">*</span> {t("login.passwordLabel")}
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.passwordPlaceholder")}
                    {...register("password")}
                    disabled={pending}
                    className="w-full rounded-xl border border-light-grey bg-transparent py-3 pl-4 pr-10 text-[14px] outline-none focus:border-primary disabled:opacity-60 lg:py-[clamp(10px,0.85vw,15px)] lg:text-[clamp(13px,0.95vw,17px)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#5E6873] transition-colors duration-200 hover:bg-gray-100 active:scale-95"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={showPassword ? "hide-password" : "show-password"}
                        initial={{ opacity: 0.75, scaleY: 0.12 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0.75, scaleY: 0.12 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="origin-center"
                      >
                        {showPassword ? <EyeClosed className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{t(errors.password.message as string)}</p>
                )}
              </div>

              <a
                href="/forgot-password"
                className="relative ml-auto mt-3 block w-fit text-right text-[13px] text-primary after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100 hover:text-primary lg:mt-5 lg:text-[clamp(13px,1vw,18px)]"
              >
                {t("login.forgotPassword")}
              </a>

              <button
                type="submit"
                disabled={pending}
                className="mt-2 w-full cursor-pointer rounded-xl bg-secondary py-3 text-[14px] font-semibold text-heading-text transition-all hover:bg-amber-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 lg:py-[clamp(11px,0.9vw,16px)] lg:text-[clamp(14px,1.05vw,18px)]"
              >
                {pending ? (t("login.submitting") ?? "Signing in…") : t("login.button")}
              </button>

              <div className="mt-6 flex w-full items-center justify-center text-[13px] text-description-text lg:mt-[clamp(22px,2.3vw,46px)] lg:text-[clamp(13px,1vw,18px)]">
                <p>{t("login.noAccount")}</p>
                <a href="/register" className="ml-2 font-semibold text-primary transition duration-400 hover:underline">
                  {t("login.register")}
                </a>
              </div>
            </form>
          </div>

          {/* Footer flows in-page on mobile, pinned on lg */}
          <footer className="mt-10 px-2 text-center text-[10px] font-medium text-description-text sm:text-[11px] lg:absolute lg:bottom-3 lg:left-0 lg:right-0 lg:mt-0 lg:px-4 lg:text-[13px]">
            <p>{t("login.footer.copyright")}</p>
            <p>{t("login.footer.links")}</p>
          </footer>
        </section>
      </section>
    </main>
  );
}