"use client";

import { useState } from "react";
import FarmerForm from "./FarmerForm";
import BuyerForm from "./BuyerForm";
import RegisterStep from "./RegisterStep";
import { Role } from "./RegisterClient";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import RegistrationSuccess from "./RegistrationSuccess";
import { REGISTER_TEXT } from "../translation";
import { createTranslator } from "../../login/LoginFlow";

type Step = 1 | 2 | 3 | 4 | 5;

type Props = {
  role: Role;
  language: string;
  onBackToSelectRole: () => void;
  initialStep?: Step;
  initialProfileSetupToken?: string;
  initialIdentifier?: string;
};

export default function RegisterFlow({
  role,
  language,
  onBackToSelectRole,
  initialStep = 1,
  initialProfileSetupToken = "",
  initialIdentifier = "",
}: Props) {
  const [step, setStep] = useState<Step>(initialStep);
  const [isCompleted, setIsCompleted] = useState(false);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [profileSetupToken, setProfileSetupToken] = useState(
    initialProfileSetupToken,
  );
  const t = createTranslator(REGISTER_TEXT, language);

  const handleBack = () => {
    if (isCompleted) {
      setIsCompleted(false);
      setStep(4);
      return;
    }

    if (step === 1) {
      onBackToSelectRole();
      return;
    }

    setStep((prev) => (prev - 1) as Step);
  };

  const handleNext = () => {
    if (step === 5) {
      setIsCompleted(true);
      return;
    }

    setStep((prev) => (prev + 1) as Step);
  };

  const handleResumeStep = (resumeStep: 2 | 3 | 4 | 5) => {
    setStep(resumeStep);
  };

  return (
    <main className="w-full px-3 py-2 sm:py-4">
      <section className="w-full max-w-240">
        {step === 1 || step === 4 ? (
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 flex items-center gap-1 text-base text-description-text hover:text-primary"
          >
            <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
            {t("register.flow.back")}
          </button>
        ) : (
          <></>
        )}

        <>
          <h1 className="text-[24px] font-bold text-[#252B37]">
            {t("register.flow.title")}{" "}
            <span className="text-primary">
              {role === "FARMER"
                ? t("register.flow.role.farmer")
                : t("register.flow.role.buyer")}
            </span>
          </h1>

          <RegisterStep language={language} role={role} currentStep={step} />

          {isCompleted ? (
            <RegistrationSuccess language={language} />
          ) : (
            <div className="mt-5">
              {role === "FARMER" && (
                <FarmerForm
                  language={language}
                  step={step}
                  role={role}
                  identifier={identifier}
                  onIdentifierChange={setIdentifier}
                  profileSetupToken={profileSetupToken}
                  onProfileToken={setProfileSetupToken}
                  onResumeStep={handleResumeStep}
                  initialProfileSetupComplete={initialStep === 5}
                  onNext={handleNext}
                />
              )}

              {role === "BUYER" && (
                <BuyerForm
                  language={language}
                  step={step}
                  role={role}
                  identifier={identifier}
                  onIdentifierChange={setIdentifier}
                  profileSetupToken={profileSetupToken}
                  onProfileToken={setProfileSetupToken}
                  onResumeStep={handleResumeStep}
                  initialProfileSetupComplete={initialStep === 5}
                  onNext={handleNext}
                />
              )}
            </div>
          )}
        </>
      </section>
    </main>
  );
}
