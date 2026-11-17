import { initializeApp, getApps } from "firebase/app";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  initializeAuth,
  getAuth,
  inMemoryPersistence,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type Auth,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { auth, firebaseConfig, isFirebaseConfigured } from "./config";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function requireAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      "Firebase is not configured yet. Please supply Firebase credentials in .env.local."
    );
  }
  return auth;
}

/** Sign in with Google Popup */
export async function signInWithGoogle(): Promise<User> {
  const firebaseAuth = requireAuth();
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  return result.user;
}

/** Sign in with Email and Password */
export async function logInWithEmail(email: string, pass: string): Promise<User> {
  const firebaseAuth = requireAuth();
  const result = await signInWithEmailAndPassword(firebaseAuth, email, pass);
  return result.user;
}

/** Register / Sign up with Email, Password and optional Display Name */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<User> {
  const firebaseAuth = requireAuth();
  const result = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

/** Sign out */
export async function logOut(): Promise<void> {
  const firebaseAuth = requireAuth();
  await signOut(firebaseAuth);
}

/** Send Password Reset Email */
export async function resetPassword(email: string): Promise<void> {
  const firebaseAuth = requireAuth();
  await sendPasswordResetEmail(firebaseAuth, email);
}

const PROVISION_APP_NAME = "team-provisioner";

function getIsolatedProvisionAuth(): Auth {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured yet.");
  }
  const existing = getApps().find((a) => a.name === PROVISION_APP_NAME);
  const provisionApp = existing ?? initializeApp(firebaseConfig, PROVISION_APP_NAME);
  try {
    // Keep secondary auth purely in memory so creating a user never signs out the active admin.
    return initializeAuth(provisionApp, { persistence: inMemoryPersistence });
  } catch {
    return getAuth(provisionApp);
  }
}

/**
 * Create a Firebase Email/Password account for a newly assigned team member
 * using an isolated in-memory Firebase App so the signed-in admin stays logged in.
 */
export async function provisionTeamUserLogin(
  email: string,
  password: string,
  displayName?: string
): Promise<"created" | "already_exists"> {
  const provisionAuth = getIsolatedProvisionAuth();
  try {
    const cred = await createUserWithEmailAndPassword(provisionAuth, email, password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    await signOut(provisionAuth);
    return "created";
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/email-already-in-use") {
      return "already_exists";
    }
    if (code === "auth/weak-password") {
      throw new Error("Password must be at least 6 characters.");
    }
    if (code === "auth/invalid-email") {
      throw new Error("Enter a valid email address.");
    }
    if (code === "auth/operation-not-allowed") {
      throw new Error(
        "Email/Password sign-in is disabled in Firebase Console (enable it under Authentication -> Sign-in method)."
      );
    }
    throw err;
  }
}

/** Subscribe to auth state changes */
export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

