"use client";

import FarmerInfoForm, { FarmerPersonalInfoDraft } from "./FarmerInfoForm";
import AccountCreationForm from "./AccountCreationForm";
import OtpForm from "./OtpForm";
import IdentityForm from "./IdentityForm";
import { useState } from "react";

type Props = {
  language: string;
  step: number;
  role: "FARMER";
  identifier: string;
  onIdentifierChange: (identifier: string) => void;
  profileSetupToken: string;
  onProfileToken: (token: string) => void;
  onResumeStep: (step: 2 | 3 | 4 | 5) => void;
  initialProfileSetupComplete?: boolean;
  onNext: () => void;
};

export default function FarmerForm({
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
    useState<FarmerPersonalInfoDraft | null>(null);
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
        <FarmerInfoForm
          language={language}
          mode="personal"
          initialPersonalInfo={personalInfo}
          onPersonalNext={(values) => {
            setPersonalInfo(values);
            onNext();
          }}
        />
      )}

      {step === 4 && (
        <FarmerInfoForm
          language={language}
          mode="farm"
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
