"use client";

import { pushToast, type ToastVariant } from "@/lib/toastStore";

type ApiResultLike = {
  success?: boolean;
  error?: string;
  message?: string;
};

type ApiToastOptions = {
  successTitle: string;
  successMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  duration?: number;
};

export function showApiToast(
  result: ApiResultLike,
  options: ApiToastOptions,
): boolean {
  const isSuccess = result.success !== false;
  const variant: ToastVariant = isSuccess ? "success" : "error";

  pushToast({
    title: isSuccess ? options.successTitle : (options.errorTitle ?? "Action failed"),
    message: isSuccess
      ? (options.successMessage ?? result.message)
      : (result.error ?? result.message ?? options.errorMessage ?? "Please try again."),
    variant,
    duration: options.duration ?? (isSuccess ? 3600 : 5200),
  });

  return isSuccess;
}

export function showApiError(error: unknown, fallback = "Please try again."): void {
  pushToast({
    title: "Action failed",
    message: error instanceof Error ? error.message : fallback,
    variant: "error",
    duration: 5200,
  });
}

export function showApiSuccess(title: string, message?: string): void {
  pushToast({
    title,
    message,
    variant: "success",
  });
}
