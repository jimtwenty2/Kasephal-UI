"use client";

import AccountCreationForm from "./AccountCreationForm";
import OtpForm from "./OtpForm";
import IdentityForm from "./IdentityForm";
import BuyerInfoForm, { BuyerPersonalInfoDraft } from "./BuyerInfoForm";
import { useState } from "react";

type Props = {
  language: string;
  step: number;
  role: "BUYER";
  identifier: string;
  onIdentifierChange: (identifier: string) => void;
  profileSetupToken: string;
  onProfileToken: (token: string) => void;
  onResumeStep: (step: 2 | 3 | 4 | 5) => void;
  initialProfileSetupComplete?: boolean;
  onNext: () => void;
};

export default function BuyerForm({
  language,
  step,
  role,
  identifier,
  onIdentifierChange,
  profileSetupToken,
  onProfileToken,
  onResumeStep,
  initialProfileSetupComplete = false,
  onNext,
}: Props) {
  const [personalInfo, setPersonalInfo] =
    useState<BuyerPersonalInfoDraft | null>(null);
  const [isProfileSetupComplete, setIsProfileSetupComplete] = useState(
    initialProfileSetupComplete,
  );

  return (
    <>
      {step === 1 && (
        <AccountCreationForm
          language={language}
          role={role}
          onNext={onNext}
          onIdentifierChange={onIdentifierChange}
          onProfileToken={onProfileToken}
          onResumeStep={(resumeStep) => {
            if (resumeStep === 5) setIsProfileSetupComplete(true);
            onResumeStep(resumeStep === 4 ? 3 : resumeStep);
          }}
        />
      )}

      {step === 2 && (
        <OtpForm
          language={language}
          identifier={identifier}
          onNext={onNext}
          onProfileToken={onProfileToken}
        />
      )}

      {step === 3 && (
        <BuyerInfoForm
          mode="personal"
          initialPersonalInfo={personalInfo}
          onPersonalNext={(values) => {
            setPersonalInfo(values);
            onNext();
          }}
        />
      )}

      {step === 4 && (
        <BuyerInfoForm
          mode="business"
          profileSetupToken={profileSetupToken}
          personalInfo={personalInfo}
          isProfileSetupComplete={isProfileSetupComplete}
          onProfileSetupComplete={() => setIsProfileSetupComplete(true)}
          onNext={onNext}
        />
      )}

      {step === 5 && (
        <IdentityForm
          language={language}
          profileSetupToken={profileSetupToken}
          onNext={onNext}
        />
      )}
    </>
  );
}
