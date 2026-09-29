"use client";

import { useEffect } from "react";
import type { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/lib/i18n/I18nContext";
import ToastContainer from "@/components/ToastContainer";
import {
  clearAuthSessionMarker,
  hasAuthSessionMarker,
} from "@/lib/authSessionMarker";

function AuthSessionGuard() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (hasAuthSessionMarker()) return;

    clearAuthSessionMarker();
    void signOut({ redirect: false });
  }, [status]);

  return null;
}

export function Providers({
  children,
  session,
  initialLanguage,
}: {
  children: React.ReactNode;
  session: Session | null;
  initialLanguage: "en" | "kh";
}) {
  return (
    <SessionProvider session={session}>
      <I18nProvider initialLanguage={initialLanguage}>
        <AuthSessionGuard />
        {children}
        <ToastContainer />
      </I18nProvider>
    </SessionProvider>
  );
}