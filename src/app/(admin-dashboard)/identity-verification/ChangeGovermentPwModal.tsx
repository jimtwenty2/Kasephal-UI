"use client";

import { useState, useEffect, type InputHTMLAttributes } from "react";
import {
  Eye,
  EyeClosed,
  X,
  Mail,
  Key,
  KeyRound,
  ShieldCheck,
  Save,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { updateGovernmentPasswordAction } from "@/action/admin/updateGovernmentPasswordAction";
import { showApiError, showApiSuccess } from "@/lib/apiToast";

const updatePasswordSchema = z
  .object({
    usernameOrEmail: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[a-z]/, "Password must include a lowercase letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangeGovernmentPwModal({ isOpen, onClose }: Props) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      usernameOrEmail: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: UpdatePasswordForm) => {
    const result = await updateGovernmentPasswordAction({
      usernameOrEmail: data.usernameOrEmail.trim(),
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    if (!result.success) {
      const message =
        result.error ??
        "We could not update this government account password. Please check the email and try again.";
      showApiError(
        new Error(message),
        "We could not update this government account password.",
      );
      return;
    }

    const message = `The password for ${data.usernameOrEmail.trim()} has been updated successfully.`;
    showApiSuccess("Password updated", message);
    reset();

    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-amber-100">
              <KeyRound size={23} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[22px] font-bold leading-7 text-slate-800">
                Set new password
              </p>
              <p className="mt-1 text-[15px] font-medium text-slate-400">
                Government account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5.5">
            {/* Email */}
            <InputField
              label="Email address"
              placeholder="gov@moaff.gov.kh"
              icon={<Mail size={18} className="text-slate-400" />}
              error={errors.usernameOrEmail?.message}
              {...register("usernameOrEmail")}
            />

            {/* New Password */}
            <PasswordField
              label="New password"
              placeholder="••••••••••"
              show={showNewPassword}
              onToggle={() => setShowNewPassword((prev) => !prev)}
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            {/* Confirm Password */}
            <PasswordField
              label="Confirm password"
              placeholder="••••••••••"
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {/* Tip banner */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <p className="text-[15px] font-medium leading-6 text-amber-700">
                Keep your government account secure by updating your password
                regularly.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-transparent text-[15px] font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-[#FFC456] text-[15px] font-semibold text-amber-900 transition hover:bg-[#f5b941] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {isSubmitting ? "Saving..." : "Set new password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: React.ReactNode;
  error?: string;
};

function InputField({ label, icon, error, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <div
        className={`flex h-12 items-center gap-3 rounded-xl border px-4 transition ${
          error
            ? "border-red-300 bg-red-50 focus-within:border-red-400"
            : "border-slate-200 bg-white focus-within:border-slate-400"
        }`}
      >
        {icon}
        <input
          {...props}
          className="w-full bg-transparent text-[15px] font-medium text-slate-700 outline-none placeholder:text-slate-300"
        />
      </div>
      {error && <p className="mt-1.5 text-[13px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
};

function PasswordField({
  label,
  show,
  onToggle,
  error,
  ...props
}: PasswordFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <div
        className={`flex h-12 items-center gap-3 rounded-xl border px-4 transition ${
          error
            ? "border-red-300 bg-red-50 focus-within:border-red-400"
            : "border-slate-200 bg-white focus-within:border-slate-400"
        }`}
      >
        <Key size={18} className="shrink-0 text-slate-400" />
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full bg-transparent text-[15px] font-medium text-slate-700 outline-none placeholder:text-slate-300"
        />
        <button
          type="button"
          onClick={onToggle}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:scale-95"
          aria-label={show ? "Hide password" : "Show password"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={show ? "hide" : "show"}
              initial={{ opacity: 0.5, scaleY: 0.2 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0.5, scaleY: 0.2 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="origin-center"
            >
              {show ? <EyeClosed size={16} /> : <Eye size={16} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      {error && <p className="mt-1.5 text-[13px] font-medium text-red-500">{error}</p>}
    </div>
  );
}
