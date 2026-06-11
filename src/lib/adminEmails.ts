/**
 * Admin allowlist.
 *
 * Public users sign in with a phone number (WhatsApp OTP) and have NO email.
 * Admins sign in with email + password. We gate /admin on the email being in
 * the ADMIN_EMAILS allowlist — being merely logged-in is NOT enough.
 *
 * Set ADMIN_EMAILS in .env.local as a comma-separated list, e.g.
 *   ADMIN_EMAILS=you@example.com,partner@example.com
 *
 * Fails CLOSED: if ADMIN_EMAILS is empty/unset, nobody is treated as admin.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}
