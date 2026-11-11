import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./config";

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

/** Subscribe to auth state changes */
export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

