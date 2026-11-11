"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { isAdminEmail } from "@/lib/admin";
import styles from "./admin.module.css";

export function AdminLogin() {
  const { isConfigured, logInWithEmail, signInWithGoogle, logOut } = useAuth();
  const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function check(action: () => Promise<{ email: string | null }>) { setError(""); setPending(true); try { const user = await action(); if (!isAdminEmail(user.email)) { await logOut(); setError("This account is not approved for the operations dashboard."); return; } router.replace("/admin"); } catch { setError("Sign-in failed. Check your account details and try again."); } finally { setPending(false); } }
  if (!isConfigured) return <div className={styles.login}><p className={styles.kicker}>One Time Product BD</p><h1>Connect Firebase to unlock operations.</h1><p>Add the Firebase public variables and <code>NEXT_PUBLIC_ADMIN_EMAILS</code> to <code>.env.local</code>. The admin dashboard only exposes live data once both are configured.</p><a className="btn btn-secondary" href="/">Back to storefront</a></div>;
  return <div className={styles.login}><p className={styles.kicker}>One Time Product BD</p><h1>Operations sign in</h1><p>Use an approved team account to manage orders and customer requests.</p><form onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); check(() => logInWithEmail(String(data.get("email")), String(data.get("password")))); }}><label><span className="lbl">Email</span><input className="field" type="email" name="email" required autoComplete="email" /></label><label><span className="lbl">Password</span><input className="field" type="password" name="password" required autoComplete="current-password" /></label>{error && <p className={styles.alert} role="alert">{error}</p>}<button className="btn btn-primary btn-block" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button></form><div className={styles.or}>or</div><button className="btn btn-secondary btn-block" disabled={pending} onClick={() => check(signInWithGoogle)}>Continue with Google</button></div>;
}
