"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { isFirebaseConfigured } from "./config";
import {
  subscribeToAuth,
  signInWithGoogle as authSignInWithGoogle,
  logInWithEmail as authLogInWithEmail,
  registerWithEmail as authRegisterWithEmail,
  logOut as authLogOut,
  resetPassword as authResetPassword,
} from "./auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<User>;
  logInWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string, displayName?: string) => Promise<User>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const u = await authSignInWithGoogle();
    setUser(u);
    return u;
  }, []);

  const logInWithEmail = useCallback(async (email: string, pass: string) => {
    const u = await authLogInWithEmail(email, pass);
    setUser(u);
    return u;
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, pass: string, displayName?: string) => {
      const u = await authRegisterWithEmail(email, pass, displayName);
      setUser(u);
      return u;
    },
    []
  );

  const logOut = useCallback(async () => {
    await authLogOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authResetPassword(email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signInWithGoogle,
      logInWithEmail,
      registerWithEmail,
      logOut,
      resetPassword,
    }),
    [
      user,
      loading,
      signInWithGoogle,
      logInWithEmail,
      registerWithEmail,
      logOut,
      resetPassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}

