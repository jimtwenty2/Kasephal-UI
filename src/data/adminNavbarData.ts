import {
  Squares2X2Icon,
  BanknotesIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { Sprout } from "lucide-react";
import type { ComponentType } from "react";

export type NavIcon = ComponentType<{ className?: string }>;


export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  /** Optional subtitle shown under the page title */
  subtitle?: string;
}

export const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: Squares2X2Icon,
    subtitle: "Platform metrics, recent activity, and key signals at a glance.",
  },
  {
    label: "User Management",
    href: "/user-management",
    icon: UsersIcon,
    subtitle: "Control marketplace access, roles, and farmer trust certification levels.",
  },
  {
    label: "Identity Verification",
    href: "/identity-verification",
    icon: IdentificationIcon,
    subtitle: "Control marketplace access, roles, and farmer trust certification levels.",
  },
  {
    label: "Request Payment",
    href: "/request-payment-management",
    icon: BanknotesIcon,
    subtitle: "Review and approve payment from Farmer and buyer requested",
  },
  {
    label: "Escrow Management",
    href: "/escrow-management",
    icon: BuildingLibraryIcon,
    subtitle: "Monitor active escrows, disputes, and release approvals.",
  },
  {
    label: "Policy management",
    href: "/policy-management",
    icon: DocumentTextIcon,
    subtitle: "Edit platform policies, terms, and contract templates.",
  },
  {
    label: "Report Management",
    href: "/report-management",
    icon: ChartBarIcon,
    subtitle: "Review and resolve disputes across the Harvest&Co marketplace.",
  },
  {
    label: "Crop Management",
    href: "/crop-management",
    icon: Sprout,
    subtitle: "Manage crop names and crop types used across the marketplace.",
  },
];

/** Find the active nav item based on the current pathname. */
export function getActiveNavItem(pathname: string | null): NavItem | undefined {
  if (!pathname) return undefined;

  // Exact match first, then prefix match (skipping "/admin" since it'd match everything)
  return (
    navItems.find((item) => item.href === pathname) ??
    navItems.find((item) => item.href !== "/dashboard" && pathname.startsWith(item.href))
  );
}
