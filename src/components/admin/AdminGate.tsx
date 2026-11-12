"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAdminEmail } from "@/lib/admin";
import { useAuth } from "@/lib/firebase/auth-context";
import styles from "./admin.module.css";

/**
 * Keeps non-admins out of /admin. The dashboard draws its own chrome, so this only gates access.
 * Real protection is the Firestore rules; this stops the UI from rendering for everyone else.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const admin = isAdminEmail(user?.email);
  const onLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!onLogin && !loading && (!isConfigured || !user || !admin)) router.replace("/admin/login");
  }, [onLogin, loading, isConfigured, user, admin, router]);

  if (onLogin) return <>{children}</>;
  if (loading) return <div className={styles.gateMsg} role="status">Checking access…</div>;
  if (!isConfigured || !user || !admin) return <div className={styles.gateMsg} role="status">Redirecting to sign in…</div>;
  return <>{children}</>;
}
