/**
 * Bridge a phone verified by OTP Space into a real Supabase session.
 *
 * OTP Space (not Supabase) now owns the OTP, so we can't use Supabase's
 * verifyOtp to produce a session. Instead, once the phone is proven, we:
 *   1. Find (or create) the auth.users row for that phone.
 *   2. Set a fresh random password on it (users never see/use this — it's
 *      internal plumbing so we can mint tokens).
 *   3. Sign in server-side with that password to obtain access/refresh tokens.
 *   4. Return them; the browser calls supabase.auth.setSession(...).
 *
 * Everything downstream (profiles, RLS via auth.uid(), admin, session refresh)
 * is unchanged — from Supabase's view a normal session simply appeared.
 */
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabase-admin";

/**
 * Authoritative lookup against auth.users (source of truth for phone).
 * Pages through the admin user list; one page at current scale. If the user
 * base grows past a few thousand, replace with an indexed RPC on auth.users.
 */
async function findAuthUserIdByPhone(msisdn: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) return null;
    const found = data.users.find((u) => (u.phone || "").replace(/\D/g, "") === msisdn);
    if (found) return found.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

export type MintResult =
  | { ok: true; accessToken: string; refreshToken: string; userId: string; isNewUser: boolean }
  | { ok: false; error: string };

export async function mintSessionForPhone(msisdn: string): Promise<MintResult> {
  const password = randomBytes(24).toString("base64url");

  // 1 + 2) find-or-create, then set the throwaway password + confirm phone.
  let userId = await findAuthUserIdByPhone(msisdn);
  if (userId) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password, phone_confirm: true,
    });
    if (error) { console.error("[otpAuth] updateUser failed:", error.message); return { ok: false, error: "update_failed" }; }
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      phone: msisdn, phone_confirm: true, password,
    });
    if (error || !data?.user) {
      // Race: exists in auth but wasn't found above (e.g. paging edge). Re-look.
      userId = await findAuthUserIdByPhone(msisdn);
      if (!userId) { console.error("[otpAuth] createUser failed:", error?.message); return { ok: false, error: "create_failed" }; }
      const { error: uerr } = await supabaseAdmin.auth.admin.updateUserById(userId, { password, phone_confirm: true });
      if (uerr) return { ok: false, error: "update_failed" };
    } else {
      userId = data.user.id;
    }
  }

  // 3) Sign in server-side with a throwaway client to obtain tokens.
  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  let signIn = await anon.auth.signInWithPassword({ phone: msisdn, password });
  if (signIn.error || !signIn.data?.session) {
    // Some GoTrue versions want the leading "+"; retry once in E.164 form.
    signIn = await anon.auth.signInWithPassword({ phone: "+" + msisdn, password });
  }
  if (signIn.error || !signIn.data?.session) {
    console.error("[otpAuth] signIn failed:", signIn.error?.message);
    return { ok: false, error: "signin_failed" };
  }

  // 4) New user = no profile name yet (mirrors the old verifyOtp behaviour).
  const { data: prof } = await supabaseAdmin
    .from("profiles").select("name").eq("id", userId).maybeSingle();
  const isNewUser = !prof?.name;

  return {
    ok: true,
    accessToken: signIn.data.session.access_token,
    refreshToken: signIn.data.session.refresh_token,
    userId,
    isNewUser,
  };
}
