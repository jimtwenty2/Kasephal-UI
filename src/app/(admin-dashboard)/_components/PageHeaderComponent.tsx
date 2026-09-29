"use client";

import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getActiveNavItem } from "@/data/adminNavbarData";
import type { ReactNode } from "react";
import NotificationButtonComponent from "@/components/action-components/NotificationButtonComponent";

interface PageHeaderProps {
  /** Override the auto-derived title from the active nav item */
  title?: string;
  /** Override the auto-derived subtitle from the active nav item */
  subtitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Optional slot for extra actions (filters, primary CTAs, etc.) */
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  searchPlaceholder = "Search platform data...",
  searchValue,
  onSearchChange,
  actions,
}: PageHeaderProps) {
  const pathname = usePathname();
  const activeItem = getActiveNavItem(pathname);

  // Use prop overrides if provided, otherwise fall back to active nav item
  const displayTitle = title ?? activeItem?.label ?? "Dashboard";
  const displaySubtitle = subtitle ?? activeItem?.subtitle;

  return (
    <header className="-mx-8 flex flex-col bg-white gap-4 px-8 pb-6 pt-8 md:flex-row md:items-start md:justify-between">
      {/* Title block */}
      <div className="min-w-0">
        <h1 className=" text-heading tracking-tight text-stone-900">
          {displayTitle}
        </h1>
        {displaySubtitle && (
          <p className="mt-1 max-w-2xl text-sm text-stone-500">
            {displaySubtitle}
          </p>
        )}
      </div>

      {/* Right-side controls */}
      <div className="flex items-center gap-3">
        <NotificationButtonComponent variant="admin" />

        {actions}
      </div>
    </header>
  );
}
