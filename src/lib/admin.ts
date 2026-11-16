/** Comma-separated allowlist of root Firebase admin email accounts. */
export function getRootAdminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

/** True if email is in the NEXT_PUBLIC_ADMIN_EMAILS bootstrap allowlist. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getRootAdminEmails().includes(email.trim().toLowerCase());
}
