import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

type BreadcrumbNavProps = {
  items: BreadcrumbItem[];
  className?: string;
  listClassName?: string;
  currentClassName?: string;
};

export default function BreadcrumbNav({
  items,
  className,
  listClassName,
  currentClassName,
}: BreadcrumbNavProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mx-auto w-full max-w-[1140px] py-3 text-xs tracking-wide text-[#667085] sm:text-sm",
        className,
      )}
    >
      <ol
        className={cn("flex min-w-0 flex-wrap items-center gap-y-1", listClassName)}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.href ?? "current"}-${index}`}
              className="flex min-w-0 items-center"
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="mx-1.5 shrink-0 text-gray-400"
                >
                  &rsaquo;
                </span>
              ) : null}

              {item.href && !isLast ? (
                <Link href={item.href} className="shrink-0 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    isLast
                      ? "max-w-[220px] truncate font-semibold text-emerald-800 sm:max-w-none"
                      : "shrink-0",
                    currentClassName && isLast ? currentClassName : undefined,
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
