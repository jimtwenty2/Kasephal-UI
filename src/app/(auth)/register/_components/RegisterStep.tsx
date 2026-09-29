"use client";

import { RegisterStep } from "../../../../data/registerData";
import { Role } from "./RegisterClient";
import { createTranslator } from "../../login/LoginFlow";
import { REGISTER_TEXT } from "../translation";

type Props = {
  language: string;
  role: Role;
  currentStep: RegisterStep;
};

export default function RegisterSteps({
  language,
  role,
  currentStep,
}: Props) {
  const t = createTranslator(REGISTER_TEXT, language);

  const steps =
    role === "FARMER"
      ? [
          t("register.step.accountCreation"),
          t("register.step.otpVerification"),
          t("register.step.personalInformation"),
          t("register.step.farmInformation"),
          t("register.step.identityVerification"),
        ]
      : [
          t("register.step.accountCreation"),
          t("register.step.otpVerification"),
          t("register.step.personalInformation"),
          t("register.step.businessInformation"),
          t("register.step.identityVerification"),
        ];

  return (
    <div className="mt-6 flex w-full items-start">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = stepNumber <= currentStep;
        const lineActive = stepNumber < currentStep;

        return (
          <div
            key={stepNumber}
            className="flex min-w-0 flex-1 items-start"
          >
            <div className="flex min-w-0 flex-1 flex-col items-center px-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm ${
                  active
                    ? "bg-linear-to-b from-[#5E8F87] to-[#0B7A43]"
                    : "bg-[#D5DBE4]"
                }`}
              >
                {stepNumber}
              </div>

              <p
                className={`mt-2 text-center font-bold leading-tight wrap-break-word
                  text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px]
                  ${
                    active
                      ? "text-primary"
                      : "text-description-text"
                  }`}
              >
                {step}
              </p>
            </div>

            {index !== steps.length - 1 && (
              <div className="mt-3.5 flex w-4 shrink-0 justify-center sm:w-8 md:w-12 lg:w-16">
                <div
                  className={`h-0.75 w-full rounded-full ${
                    lineActive ? "bg-primary" : "bg-[#D5DBE4]"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}