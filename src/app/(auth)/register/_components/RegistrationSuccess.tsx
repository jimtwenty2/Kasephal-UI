"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

import { createTranslator } from "../../login/LoginFlow";
import { REGISTER_TEXT } from "../translation";

type Props = {
  language: string;
};

export default function RegistrationSuccess({ language }: Props) {
  const router = useRouter();
  const t = createTranslator(REGISTER_TEXT, language);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
      <CheckCircleIcon className="h-20 w-20 text-primary/85" />

      <h2 className="mt-6 text-3xl font-bold text-primary">
        {t("register.success.title")}
      </h2>

      <p className="mt-3 text-description-text">
        {t("register.success.description")}
      </p>

      <button
        type="button"
        onClick={() => router.push("/login")}
        className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        {t("register.success.button")}
      </button>
    </div>
  );
}