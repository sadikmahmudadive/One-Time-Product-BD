"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { isAdminEmail } from "@/lib/admin";
import styles from "./admin.module.css";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const admin = isAdminEmail(user?.email);
  const loginRoute = pathname === "/admin/login";
  useEffect(() => { if (!loginRoute && !loading && (!isConfigured || !user || !admin)) router.replace("/admin/login"); }, [loginRoute, loading, isConfigured, user, admin, router]);
  if (loginRoute) return <>{children}</>;
  if (loading) return <div className={styles.center}>Checking access…</div>;
  if (!isConfigured || !user || !admin) return <div className={styles.center}>Redirecting to sign in…</div>;
  return <div className={styles.shell}><header className={styles.header}><Link href="/admin" className={styles.brand}>One Time <span>Operations</span></Link><div><span className={styles.email}>{user.email}</span><button className={styles.signout} onClick={() => logOut()}>Sign out</button></div></header><nav className={styles.nav} aria-label="Admin"><Link href="/admin">Dashboard</Link><Link href="/shop">Storefront</Link><Link href="/">Website home</Link></nav><main className={styles.main}>{children}</main></div>;
}
