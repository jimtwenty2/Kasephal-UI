"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeClosed } from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/schema/reset-password.schema";

import { pushToast } from "@/lib/toastStore";
import { resetPasswordInitiateAction } from "@/action/auth/forgot-password.action";

import { FORGOT_PASSWORD_TEXT } from "./ForgotPasswordPageClient";
import { createTranslator } from "../../login/LoginFlow";

type Props = {
  language: string;
  identifier: string;
};

export default function SetNewPassword({
  language,
  identifier,
}: Props) {
  const t = createTranslator(FORGOT_PASSWORD_TEXT, language);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);

    const result = await resetPasswordInitiateAction(data, identifier);

    setLoading(false);

    if (!result.success) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof ResetPasswordFormData, {
          type: "server",
          message,
        });
      });

      pushToast({
        title: t("forgotPassword.password.toast.failedTitle"),
        message: result.error,
        variant: "error",
      });

      return;
    }

    pushToast({
      title: t("forgotPassword.password.toast.successTitle"),
      message: t("forgotPassword.password.toast.successMessage"),
      variant: "success",
    });

    router.push("/login");
  };

  return (
    <section className="w-full max-w-115">
      {/* Title */}
      <h1 className="text-[30px] font-bold text-[#252B37]">
        {t("forgotPassword.password.title")}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-[clamp(13px,0.95vw,17px)] font-bold text-primary">
            <span className="text-red-500">*</span>{" "}
            {t("forgotPassword.password.newPassword")}
          </label>

          <div className="flex h-12 items-center rounded-[10px] border border-[#D9DEE5] px-4 focus-within:border-primary">
            <input
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
              placeholder={t(
                "forgotPassword.password.newPasswordPlaceholder",
              )}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-gray-100"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={showPassword ? "hide" : "show"}
                  initial={{ opacity: 0.75, scaleY: 0.12 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0.75, scaleY: 0.12 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {showPassword ? (
                    <EyeClosed className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[clamp(13px,0.95vw,17px)] font-bold text-primary">
            <span className="text-red-500">*</span>{" "}
            {t("forgotPassword.password.confirmPassword")}
          </label>

          <div className="flex h-12 items-center rounded-[10px] border border-[#D9DEE5] px-4 focus-within:border-primary">
            <input
              type={showConfirm ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder={t(
                "forgotPassword.password.confirmPasswordPlaceholder",
              )}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
            />

            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6B7280] transition hover:bg-gray-100"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={showConfirm ? "hide" : "show"}
                  initial={{ opacity: 0.75, scaleY: 0.12 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  exit={{ opacity: 0.75, scaleY: 0.12 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {showConfirm ? (
                    <EyeClosed className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-[10px] bg-secondary font-semibold text-heading-text transition hover:bg-amber-500 hover:text-white disabled:opacity-60"
        >
          {t("forgotPassword.password.updatePassword")}
        </button>
      </form>
    </section>
  );
}