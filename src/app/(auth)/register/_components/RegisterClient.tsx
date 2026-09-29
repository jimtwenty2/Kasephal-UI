"use client";

import Image from "next/image";
import { useState } from "react";

import SelectRole from "./SelectRole";
import RegisterFlow from "./RegisterFlow";
import { useI18n } from "@/lib/i18n/I18nContext";
import { createTranslator } from "../../login/LoginFlow";
import { REGISTER_TEXT } from "../translation";

export type Role = "FARMER" | "BUYER";

type ResumeState = {
  role: Role;
  step: 1 | 2 | 3 | 4 | 5;
  profileSetupToken?: string;
  identifier?: string;
};

const REGISTER_RESUME_STORAGE_KEY = "kasephal-register-resume";

function readResumeState(): ResumeState | null {
  try {
    const raw = sessionStorage.getItem(REGISTER_RESUME_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ResumeState>;

    const role =
      parsed.role === "FARMER" || parsed.role === "BUYER" ? parsed.role : null;

    const step =
      parsed.step === 1 ||
      parsed.step === 2 ||
      parsed.step === 3 ||
      parsed.step === 4 ||
      parsed.step === 5
        ? parsed.step
        : null;

    if (!role || !step) return null;
    if (step !== 2 && !parsed.profileSetupToken) return null;

    return {
      role,
      step,
      profileSetupToken: parsed.profileSetupToken,
      identifier: parsed.identifier,
    };
  } catch {
    return null;
  }
}

export default function RegisterClient() {
  const [resumeState] = useState<ResumeState | null>(() => {
    if (typeof window === "undefined") return null;

    const state = readResumeState();

    if (!state) return null;

    sessionStorage.removeItem(REGISTER_RESUME_STORAGE_KEY);

    return state;
  });

  const [role, setRole] = useState<Role | null>(resumeState?.role ?? null);

  const isFarmer = role === "FARMER";

  const { language } = useI18n();
  const t = createTranslator(REGISTER_TEXT, language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";

  return (
    <main
      className={`fixed inset-0 overflow-hidden bg-white font-medium ${fontClass}`}
    >
      <section className="flex h-full w-full overflow-hidden p-3 sm:p-4 lg:p-5">
        {/* Left Hero */}
        <section
          className={`relative hidden overflow-hidden rounded-[24px] bg-background lg:flex lg:flex-col ${
            role ? "lg:w-[25%]" : "lg:w-[45%]"
          }`}
        >
          <div className="relative z-20 p-5 lg:px-[clamp(30px,4vw,70px)] lg:py-[clamp(30px,4vw,70px)]">
            <Image
              src="/assets/logo-green.png"
              width={150}
              height={60}
              alt="logo-kasephal"
              className="h-auto w-[clamp(110px,8vw,150px)]"
            />

            <div className="mt-[clamp(28px,3vw,60px)] max-w-155 leading-10">
              <div
                className={`relative font-extrabold leading-[1.1] ${
                  role
                    ? "text-[clamp(52px,2.3vw,46px)]"
                    : "text-[clamp(48px,3vw,58px)]"
                }`}
              >
                <h1 className="font-heading text-secondary">
                  {!role
                    ? t("register.hero.default.title1")
                    : isFarmer
                      ? t("register.hero.farmer.title1")
                      : t("register.hero.buyer.title1")}
                </h1>

                <h1 className="text-heading-text">
                  {!role
                    ? t("register.hero.default.title2")
                    : isFarmer
                      ? t("register.hero.farmer.title2")
                      : t("register.hero.buyer.title2")}

                  <span className="text-primary">
                    {!role
                      ? t("register.hero.default.title3")
                      : isFarmer
                        ? t("register.hero.farmer.title3")
                        : t("register.hero.buyer.title3")}
                  </span>
                </h1>

                {!role && (
                  <h1 className="text-heading-text">
                    {t("register.hero.default.title4")}{" "}
                    <span className="text-primary">
                      {t("register.hero.default.title5")}
                    </span>
                  </h1>
                )}

                <Image
                  src="/assets/leaf.png"
                  width={80}
                  height={65}
                  alt="leaf"
                  className="absolute right-5 top-0 h-auto w-[clamp(50px,4vw,90px)]"
                />
              </div>

              <p className="mt-5 max-w-120 text-[clamp(15px,1vw,18px)] leading-normal text-description-text">
                {!role
                  ? t("register.hero.default.description")
                  : isFarmer
                    ? t("register.hero.farmer.description")
                    : t("register.hero.buyer.description")}
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
            className={`absolute right-0 z-10 h-auto object-contain ${
              role
                ? "bottom-0 max-h-[42%] w-auto"
                : "bottom-[-18%] max-h-[78%] w-[78%]"
            }`}
          />
        </section>

        {/* Right Content */}
        <section
          className={`relative flex h-full items-start justify-center overflow-y-auto bg-white px-4 py-4 sm:overflow-hidden sm:px-8 sm:py-5 lg:px-8 lg:py-6 ${
            role ? "w-full lg:w-[65%]" : "w-full lg:w-[55%]"
          }`}
        >
          <section className="relative z-20 flex min-h-full w-full items-start justify-center">
            <div className="w-full max-w-190">
              {!role ? (
                <SelectRole language={language} onSelectRole={setRole} />
              ) : (
                <RegisterFlow
                  language={language}
                  key={`${role}-${resumeState?.step ?? 1}-${resumeState?.profileSetupToken ?? ""}`}
                  role={role}
                  initialStep={resumeState?.step}
                  initialProfileSetupToken={resumeState?.profileSetupToken}
                  initialIdentifier={resumeState?.identifier}
                  onBackToSelectRole={() => setRole(null)}
                />
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
