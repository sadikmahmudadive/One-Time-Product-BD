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
import { isAdminEmail } from "@/lib/admin";
import { resolveUserAccess, type TeamMember, type UserAccess } from "@/lib/roles";
import { isFirebaseConfigured } from "./config";
import {
  subscribeToAuth,
  signInWithGoogle as authSignInWithGoogle,
  logInWithEmail as authLogInWithEmail,
  registerWithEmail as authRegisterWithEmail,
  logOut as authLogOut,
  resetPassword as authResetPassword,
} from "./auth";
import { subscribeMyTeamRole } from "./firestore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  accessLoading: boolean;
  access: UserAccess;
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
  const [teamRecord, setTeamRecord] = useState<TeamMember | null>(null);
  const [roleResolvedEmail, setRoleResolvedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      if (!currentUser?.email) {
        setTeamRecord(null);
        setRoleResolvedEmail(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to this user's Firestore role (`team_roles/{email}`) when not a root env admin.
  useEffect(() => {
    const email = user?.email?.trim().toLowerCase() ?? null;
    if (!isFirebaseConfigured || !email || isAdminEmail(email)) {
      setTeamRecord(null);
      setRoleResolvedEmail(email);
      return;
    }

    const unsub = subscribeMyTeamRole(
      email,
      (member) => {
        setTeamRecord(member);
        setRoleResolvedEmail(email);
      },
      () => {
        setTeamRecord(null);
        setRoleResolvedEmail(email);
      }
    );
    return unsub;
  }, [user]);

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
    setTeamRecord(null);
    setRoleResolvedEmail(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authResetPassword(email);
  }, []);

  const normalizedEmail = user?.email?.trim().toLowerCase() ?? null;
  const isRootEnvAdmin = isAdminEmail(normalizedEmail);
  const accessLoading =
    Boolean(isFirebaseConfigured && normalizedEmail && !isRootEnvAdmin && roleResolvedEmail !== normalizedEmail);

  const access = useMemo<UserAccess>(
    () => resolveUserAccess(user?.email, isRootEnvAdmin, teamRecord),
    [user?.email, isRootEnvAdmin, teamRecord]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      accessLoading,
      access,
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
      accessLoading,
      access,
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
