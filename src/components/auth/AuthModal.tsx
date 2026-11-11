"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import styles from "./AuthModal.module.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.95v2.33A8.99 8.99 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.17.28-1.71V4.96H.95A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.95 4.04l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A8.99 8.99 0 0 0 .95 4.96l3.01 2.33c.71-2.13 2.7-3.71 5.04-3.71z"
      />
    </svg>
  );
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const { signInWithGoogle, logInWithEmail, registerWithEmail, isConfigured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(defaultMode);
    setError(null);
  }, [defaultMode, isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function parseFirebaseError(err: unknown): string {
    const code = (err as { code?: string })?.code || "";
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password. Please verify and try again.";
      case "auth/email-already-in-use":
        return "An account with this email address already exists. Please sign in instead.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/popup-closed-by-user":
        return "Google sign-in popup was closed before completing.";
      default:
        return (err as Error)?.message || "Authentication failed. Please try again.";
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await registerWithEmail(email, password, name.trim());
      } else {
        await logInWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError(parseFirebaseError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
          ✕
        </button>

        <div className={styles.head}>
          <h2 id="auth-modal-title" className={styles.title}>
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h2>
          <p className={styles.subtitle}>
            {mode === "signin"
              ? "Sign in to track quotes, orders, and save details."
              : "Register to manage wholesale enquiries and orders easily."}
          </p>
        </div>

        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogleSignIn}
          disabled={loading || !isConfigured}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <div className={styles.divider}>or with email</div>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            className={`${styles.tab} ${mode === "signin" ? styles.activeTab : ""}`}
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={`${styles.tab} ${mode === "signup" ? styles.activeTab : ""}`}
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "signup" && (
            <div>
              <label className="lbl" htmlFor="auth-name">
                Full name
              </label>
              <input
                id="auth-name"
                className="field"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahim Ahmed"
              />
            </div>
          )}

          <div>
            <label className="lbl" htmlFor="auth-email">
              Email address
            </label>
            <input
              id="auth-email"
              className="field"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="lbl" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="field"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !isConfigured}
            style={{ marginTop: 6 }}
          >
            {loading ? "Processing…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className={styles.footerNote}>
          By signing in, you agree to One Time Product BD&apos;s service terms for food packaging orders.
        </p>
      </div>
    </div>
  );
}

