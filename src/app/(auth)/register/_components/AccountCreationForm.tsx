"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountSchema, accountSchema } from "@/schema/account-creation.schema";
import { accountCreationAction } from "@/action/auth/account-creation.action";
import { pushToast } from "@/lib/toastStore";
import { maskIdentifier } from "@/utils/maskIdentifier";
import FormHeader from "./FormHeader";
import Input from "./Input";
import SubmitButton from "./SubmitButton";
import { createTranslator } from "../../login/LoginFlow";
import { REGISTER_TEXT } from "../translation";
type Props = {
  language: string;
  role: "FARMER" | "BUYER";
  onNext: () => void;
  onIdentifierChange: (identifier: string) => void;
  onProfileToken: (token: string) => void;
  onResumeStep: (step: 2 | 3 | 4 | 5) => void;
};

function getAccountCreationErrorMessage(error: string) {
  const match = error.match(/registered as (FARMER|BUYER)/i);

  if (!match) return error;

  const role = match[1].toUpperCase() === "FARMER" ? "Farmer" : "Buyer";

  return `This email or phone number is already registered as a ${role} account.`;
}

export default function AccountCreationForm({
  language,
  role,
  onNext,
  onIdentifierChange,
  onProfileToken,
  onResumeStep,
}: Props) {
  const t = createTranslator(REGISTER_TEXT, language);

  const [registerVia, setRegisterVia] = useState<"phone" | "email">("phone");

  const [loading, setLoading] = useState(false);

  const [serverError, setServerError] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<AccountSchema>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: AccountSchema) {
    setLoading(true);

    let phoneNumber = values.phoneNumber?.trim();

    if (phoneNumber) {
      phoneNumber = phoneNumber.startsWith("0")
        ? phoneNumber
        : "0" + phoneNumber;
    }

    const identifier = values.email?.trim() || phoneNumber;

    if (!identifier) {
      setServerError(t("register.account.phoneRequired"));

      setLoading(false);
      return;
    }

    values.phoneNumber = phoneNumber;

    const result = await accountCreationAction(values, role);

    setLoading(false);

    if (!result.success) {
      const message = getAccountCreationErrorMessage(result.error);

      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof AccountSchema, {
          type: "server",
          message,
        });
      });

      pushToast({
        title: t("register.account.creationFailed"),
        message,
        variant: "error",
      });

      return;
    }

    onIdentifierChange(identifier);

    if (result.resume) {
      onProfileToken(result.profileSetupToken);

      pushToast({
        title: t("register.account.resume"),
        message: result.message,
        variant: "success",
      });

      onResumeStep(result.resumeStep);

      return;
    }

    pushToast({
      title: t("register.account.otpSent"),
      message: `${t("register.account.otpSent")} ${maskIdentifier(identifier)}`,
      variant: "success",
    });

    onNext();
  }

  function switchRegister() {
    resetField(registerVia === "phone" ? "phoneNumber" : "email");

    setRegisterVia((prev) => (prev === "phone" ? "email" : "phone"));
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-md flex-col px-3 sm:px-0"
    >
      <FormHeader
        title={t("register.account.title")}
        description={t("register.account.description")}
      />

      <div className="mt-5 space-y-4">
        {registerVia === "phone" ? (
          <Input
            label={t("register.account.phoneNumber")}
            type="tel"
            placeholder={t("register.account.enterPhone")}
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
          />
        ) : (
          <Input
            label={t("register.account.email")}
            type="email"
            placeholder={t("register.account.enterEmail")}
            {...register("email")}
            error={errors.email?.message}
          />
        )}

        <Input
          label={t("register.account.password")}
          type="password"
          placeholder={t("register.account.enterPassword")}
          {...register("password")}
          error={errors.password?.message}
        />

        <Input
          label={t("register.account.confirmPassword")}
          type="password"
          placeholder={t("register.account.enterConfirmPassword")}
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      </div>

      {serverError && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </p>
      )}

      {serverMessage && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {serverMessage}
        </p>
      )}

      <SubmitButton disabled={loading}>
        {loading
          ? t("register.account.creating")
          : t("register.account.continue")}
      </SubmitButton>

      <p className="mt-5 text-center text-sm text-description-text">
        {t("register.account.registerVia")}{" "}
        <button
          type="button"
          onClick={switchRegister}
          className="font-semibold text-primary hover:underline"
        >
          {registerVia === "phone"
            ? t("register.account.switchEmail")
            : t("register.account.switchPhone")}
        </button>
      </p>
    </form>
  );
}
