/** Comma-separated allowlist of Firebase email accounts that may use /admin. */
export function isAdminEmail(email: string | null | undefined): boolean {
  const allowed = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allowed.includes(email.toLowerCase()));
}
