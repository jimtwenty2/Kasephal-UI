"use client";

import { useState } from "react";

import ForgotPassword from "./ForgotPassword";
import PhoneRecoveryMethod from "./PhoneRecoveryMethod";
import AccountRecovery from "./AccountRecovery";
import OtpVerification from "./OtpVerification";
import SetNewPassword from "./SetNewPassword";

type Step = "email" | "phone-method" | "account-recovery" | "otp" | "password";

interface ForgotPasswordFormProps {
  language: string;
}

export default function ForgotPasswordForm({
  language,
}: ForgotPasswordFormProps) {
  const lang = language;
  const [step, setStep] = useState<Step>("email");
  const [identifier, setIdentifier] = useState("");

  return (
    <>
      {step === "email" && (
        <ForgotPassword
          language={lang}
          onSendCode={(identifier) => {
            setIdentifier(identifier);
            setStep("otp");
          }}
          onTryAnotherWay={() => setStep("phone-method")}
        />
      )}

      {step === "phone-method" && (
        <PhoneRecoveryMethod
          language={lang}
          onBack={() => setStep("email")}
          onSendCode={() => setStep("account-recovery")}
          onTryAnotherWay={() => setStep("email")}
        />
      )}

      {step === "account-recovery" && (
        <AccountRecovery
          language={lang}
          onBack={() => setStep("phone-method")}
          onSendCode={(phoneNumber) => {
            setIdentifier(phoneNumber);
            setStep("otp");
          }}
          onTryAnotherWay={() => setStep("email")}
        />
      )}

      {step === "otp" && (
        <OtpVerification
          language={lang}
          identifier={identifier}
          onBack={() => setStep("account-recovery")}
          onVerify={() => setStep("password")}
        />
      )}

      {step === "password" && (
        <SetNewPassword language={lang} identifier={identifier} />
      )}
    </>
  );
}
