"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import { navItems } from "@/data/adminNavbarData";
import LogoutConfirmModal from "@/components/action-components/LogoutConfirmModal";
import { logoutService } from "@/services/auth/auth.service";
import { clearAuthSessionMarker } from "@/lib/authSessionMarker";

const ADMIN_PROFILE_IMAGE = "/assets/nav-bar/admin-profile.png";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      const accessToken = session?.user?.accessToken;

      if (accessToken) {
        const result = await logoutService(accessToken);

        if (!result.success) {
          
        }
      }

      await signOut({ redirect: false });
      clearAuthSessionMarker();
      setLogoutOpen(false);
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-background px-4 py-6">
      {/* Logo */}
      <div className="flex items-center justify-center px-3 pb-5">
        <Image
          src="/assets/kasephalogo.png"
          alt="Kasephal"
          width={100}
          height={38}
          priority
          className="h-auto w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-300/90 text-stone-900 shadow-sm"
                  : "text-stone-700 hover:bg-stone-200/50"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile + Logout */}
      <div className="space-y-2 pt-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Image
            src={ADMIN_PROFILE_IMAGE}
            alt="Admin profile"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">
              Admin
            </p>

            <p className="truncate text-xs text-stone-500">Administrator</p>
          </div>
        </div>

        <button
          onClick={() => setLogoutOpen(true)}
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200/50 hover:text-stone-900"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />

          <span>Logout</span>
        </button>
      </div>
      <LogoutConfirmModal
        open={logoutOpen}
        isSubmitting={isLoggingOut}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
}
