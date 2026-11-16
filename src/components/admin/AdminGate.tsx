"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import styles from "./admin.module.css";

/**
 * Keeps unauthorized accounts out of /admin. Allows approved Admins and active Store Managers.
 * Real enforcement lives in Firestore security rules; this keeps UI gated cleanly.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, accessLoading, access, isConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const onLogin = pathname === "/admin/login";
  const checking = loading || accessLoading;

  useEffect(() => {
    if (!onLogin && !checking && (!isConfigured || !user || !access.isTeamMember)) {
      router.replace("/admin/login");
    }
  }, [onLogin, checking, isConfigured, user, access.isTeamMember, router]);

  if (onLogin) return <>{children}</>;
  if (checking) return <div className={styles.gateMsg} role="status">Checking access…</div>;
  if (!isConfigured || !user || !access.isTeamMember) {
    return <div className={styles.gateMsg} role="status">Redirecting to sign in…</div>;
  }
  return <>{children}</>;
}
