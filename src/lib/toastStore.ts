"use client";

import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  referenceType?: string | null;
  onClick?: () => void | Promise<void>;
  variant: ToastVariant;
  duration: number;
}

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): Toast[] {
  return toasts;
}

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function pushToast(input: {
  title: string;
  message?: string;
  referenceType?: string | null;
  onClick?: () => void | Promise<void>;
  variant?: ToastVariant;
  duration?: number;
}): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const next: Toast = {
    id,
    title: input.title,
    message: input.message,
    referenceType: input.referenceType,
    onClick: input.onClick,
    variant: input.variant ?? "success",
    duration: input.duration ?? 3000,
  };
  toasts = [...toasts, next];
  emit();
  return id;
}

export function dismissToast(id: string): void {
  const before = toasts.length;
  toasts = toasts.filter((t) => t.id !== id);
  if (toasts.length !== before) emit();
}
