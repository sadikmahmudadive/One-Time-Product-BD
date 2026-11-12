"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { isAdminEmail } from "@/lib/admin";
import { useAuth } from "@/lib/firebase/auth-context";
import styles from "./admin.module.css";

export function AdminLogin() {
  const { isConfigured, logInWithEmail, signInWithGoogle, logOut } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function check(action: () => Promise<{ email: string | null }>) {
    setError("");
    setPending(true);
    try {
      const user = await action();
      if (!isAdminEmail(user.email)) {
        await logOut();
        setError("This account isn’t approved for the operations dashboard.");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Sign-in failed. Check your details and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.loginShell}>
      <aside className={styles.loginAside}>
        <Logo tone="dark" knockout="var(--brand-950)" size={28} />
        <div>
          <p className={styles.loginQuote}>One place for orders, stock and customers.</p>
          <p className={styles.loginSub}>Operations dashboard for the One Time Product BD team.</p>
        </div>
        <Link href="/" className={styles.loginBack}>
          ← Back to the storefront
        </Link>
      </aside>

      <section className={styles.loginMain}>
        <div className={styles.loginCard}>
          {!isConfigured ? (
            <>
              <h1>Connect Firebase</h1>
              <p className={styles.loginHint}>
                Add the Firebase public variables and <code>NEXT_PUBLIC_ADMIN_EMAILS</code> to <code>.env.local</code>. The dashboard only shows live data once both are set.
              </p>
            </>
          ) : (
            <>
              <h1>Sign in</h1>
              <p className={styles.loginHint}>Use an approved team account.</p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  check(() => logInWithEmail(String(data.get("email")), String(data.get("password"))));
                }}
              >
                <label>
                  <span className="lbl">Email</span>
                  <input className="field" type="email" name="email" required autoComplete="email" />
                </label>
                <label>
                  <span className="lbl">Password</span>
                  <input className="field" type="password" name="password" required autoComplete="current-password" />
                </label>
                {error && (
                  <p className={styles.loginError} role="alert">
                    {error}
                  </p>
                )}
                <button className="btn btn-primary btn-block" disabled={pending}>
                  {pending ? "Signing in…" : "Sign in"}
                </button>
              </form>
              <div className={styles.loginOr}>
                <span>or</span>
              </div>
              <button type="button" className="btn btn-secondary btn-block" disabled={pending} onClick={() => check(signInWithGoogle)}>
                Continue with Google
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
