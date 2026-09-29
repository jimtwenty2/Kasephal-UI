"use client";

import { createElement, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  dismissToast,
  useToasts,
  type Toast,
  type ToastVariant,
} from "@/lib/toastStore";
import { getNotificationReferenceIcon } from "@/lib/notificationIcons";

const VARIANT_STYLES: Record<
  ToastVariant,
  {
    border: string;
    glow: string;
    iconWrap: string;
    iconClass: string;
    progress: string;
  }
> = {
  success: {
    border: "border-emerald-200/80",
    glow: "shadow-[0_18px_48px_rgba(22,163,74,0.16)]",
    iconWrap: "bg-emerald-50 ring-1 ring-emerald-100",
    iconClass: "text-emerald-700",
    progress: "bg-emerald-500",
  },
  error: {
    border: "border-rose-200/90",
    glow: "shadow-[0_18px_48px_rgba(225,29,72,0.14)]",
    iconWrap: "bg-rose-50 ring-1 ring-rose-100",
    iconClass: "text-rose-600",
    progress: "bg-rose-500",
  },
  info: {
    border: "border-sky-200/90",
    glow: "shadow-[0_18px_48px_rgba(2,132,199,0.14)]",
    iconWrap: "bg-sky-50 ring-1 ring-sky-100",
    iconClass: "text-sky-600",
    progress: "bg-sky-500",
  },
};

function ToastIcon({ toast }: { toast: Toast }) {
  if (toast.referenceType) {
    const ReferenceIcon = getNotificationReferenceIcon(toast.referenceType);

    return (
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {createElement(ReferenceIcon, {
          className: "h-4.5 w-4.5 text-primary",
          strokeWidth: 2.2,
        })}
      </span>
    );
  }

  const { variant } = toast;
  const style = VARIANT_STYLES[variant];
  const Icon =
    variant === "success"
      ? CheckCircleIcon
      : variant === "error"
        ? ExclamationCircleIcon
        : InformationCircleIcon;
  return (
    <span
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}
    >
      <Icon className={`h-5 w-5 ${style.iconClass}`} />
    </span>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  useEffect(() => {
    const handle = setTimeout(() => dismissToast(toast.id), toast.duration);
    return () => clearTimeout(handle);
  }, [toast.id, toast.duration]);

  const style = VARIANT_STYLES[toast.variant];
  const progressClass = toast.referenceType
    ? VARIANT_STYLES.success.progress
    : style.progress;
  const isClickable = Boolean(toast.onClick);

  const handleOpen = () => {
    if (!toast.onClick) return;

    dismissToast(toast.id);
    void toast.onClick();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 120 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 120 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      role={isClickable ? "button" : toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (!isClickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      className={`pointer-events-auto relative flex w-[calc(100vw-2rem)] max-w-[410px] items-start gap-3 overflow-hidden rounded-2xl border bg-white/95 p-4 text-left backdrop-blur-xl ${style.border} ${style.glow} ${
        isClickable
          ? "cursor-pointer transition-transform hover:-translate-y-0.5 hover:border-primary/30"
          : ""
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-stone-100">
        <Image
          src="/assets/logo-green.png"
          alt="Kasephal"
          width={30}
          height={30}
          className="h-7 w-7 object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <ToastIcon toast={toast} />
          <p className="text-[14px] font-bold leading-5 text-primary-heading">
            {toast.title}
          </p>
        </div>
        {toast.message && (
          <p className="mt-1 text-[13px] font-medium leading-5 text-secondary-body">
            {toast.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          dismissToast(toast.id);
        }}
        aria-label="Dismiss"
        className="shrink-0 rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
      <span className="absolute inset-x-0 bottom-0 h-1 bg-stone-100">
        <motion.span
          className={`block h-full origin-right ${progressClass}`}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{
            duration: toast.duration / 1000,
            ease: "linear",
          }}
        />
      </span>
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useToasts();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[11000] flex flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
