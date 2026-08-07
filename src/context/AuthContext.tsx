"use client";
import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, type ReactNode,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";

export type Kid = { name: string; dob: string; gender?: "male" | "female" };

export type UserData = {
  id: string;                   // Supabase auth.users UUID
  phone: string;
  name: string;
  address?: string;
  addressLat?: number;
  addressLng?: number;
  dob?: string;
  kids: Kid[];
  avatar?: string;              // base64 local photo — Phase 2: migrate to avatarUrl
  avatarUrl?: string;           // Supabase Storage public URL
  tier?: "free" | "premium";
  lifetime?: boolean;
  premiumExpiresAt?: string;
};

export type Tier = "free" | "premium";

type AuthContextType = {
  user: UserData | null;
  tier: Tier;
  /** true once profile name is set (completed registration) */
  isRegistered: boolean;
  loaded: boolean;
  /** Send OTP to phone (local +62 format, e.g. "8123456789"); normalised internally */
  sendOtp: (phone: string) => Promise<{ error?: string }>;
  /** Verify the OTP code. Returns isNewUser=true when the profile has no name yet */
  verifyOtp: (phone: string, code: string) => Promise<{ error?: string; isNewUser?: boolean }>;
  /** Save / update profile data (called after OTP verify or on profile edit) */
  register: (data: Omit<UserData, "id" | "tier" | "lifetime" | "premiumExpiresAt">) => Promise<{ error?: string }>;
  /** Partial profile update convenience wrapper */
  updateUser: (data: Partial<Omit<UserData, "id" | "tier" | "lifetime" | "premiumExpiresAt">>) => Promise<void>;
  logout: () => Promise<void>;
  /** No-op in soft launch. Kept for API compatibility. */
  upgradeToPremium: (lifetime?: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null, tier: "free", isRegistered: false, loaded: false,
  sendOtp:          async () => ({}),
  verifyOtp:        async () => ({}),
  register:         async () => ({}),
  updateUser:       async () => {},
  logout:           async () => {},
  upgradeToPremium: () => {},
});

/** Normalise a local phone to E.164 (+628…) */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0"))  return `+62${digits.slice(1)}`;
  return `+62${digits}`;
}

// ── Profile cache ─────────────────────────────────────────────────────────────
// The logged-in UI must not depend on a live `profiles` fetch (which can be slow
// or fail under DB load). We cache the last-known profile per user id so name +
// avatar are always available instantly — a failing fetch can never wipe them.
const PROFILE_CACHE_PREFIX = "tk_profile_";

function localPhoto(id: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(`profilePhoto_${id}`) ?? undefined;
}

function readProfileCache(id: string): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(PROFILE_CACHE_PREFIX + id);
    if (!s) return null;
    const u = JSON.parse(s) as UserData;
    return { ...u, avatar: localPhoto(id) };
  } catch { return null; }
}

function writeProfileCache(u: UserData) {
  if (typeof window === "undefined") return;
  try {
    // Exclude the (possibly large) base64 avatar; it lives under its own key.
    const { avatar: _avatar, ...rest } = u;
    void _avatar;
    localStorage.setItem(PROFILE_CACHE_PREFIX + u.id, JSON.stringify(rest));
  } catch {}
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function mapProfileRow(data: any, session: Session): UserData {
  return {
    id:               data.id,
    phone:            data.phone            ?? session.user.phone ?? "",
    name:             data.name             ?? "",
    address:          data.address          ?? undefined,
    addressLat:       data.address_lat      ?? undefined,
    addressLng:       data.address_lng      ?? undefined,
    dob:              data.dob              ?? undefined,
    kids:             (data.kids as Kid[])  ?? [],
    avatar:           localPhoto(data.id),
    avatarUrl:        data.avatar_url       ?? undefined,
    tier:             (data.tier as "free" | "premium") ?? "free",
    lifetime:         data.lifetime         ?? false,
    premiumExpiresAt: data.premium_expires_at ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser]     = useState<UserData | null>(null);
  const [loaded, setLoaded] = useState(false);
  // The uid we currently hold a FRESH DB profile for — lets us skip redundant
  // refetches (token-refresh / window-focus fire SIGNED_IN repeatedly).
  const profileFor = useRef<string | null>(null);

  /**
   * Reconcile auth state from a Supabase session.
   *
   * Logged-in state is reflected IMMEDIATELY from the session + cached profile,
   * so the UI is never half-logged-out while the DB read is in flight or
   * failing. The `profiles` fetch is best-effort with retries and can never
   * downgrade a logged-in user.
   */
  const loadProfile = useCallback(async (session: Session | null, force = false) => {
    if (!session?.user) {
      profileFor.current = null;
      setUser(null);
      setLoaded(true);
      return;
    }
    const uid = session.user.id;

    // Already hold a fresh profile for this user → nothing to do. Cuts the
    // refetch churn from token-refresh / focus events (each was a failure chance).
    if (profileFor.current === uid && !force) {
      setLoaded(true);
      return;
    }

    // 1) Reflect logged-in state instantly from cache (or a minimal session
    //    profile), so a slow/failing fetch never shows a half-logged-out UI.
    setUser((prev) => {
      if (prev && prev.id === uid && !force) return prev;
      return readProfileCache(uid)
        ?? { id: uid, phone: session.user.phone ?? "", name: "", kids: [] };
    });
    setLoaded(true);

    // 2) Best-effort fetch with retries. NEVER downgrade on failure.
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from("profiles").select("*").eq("id", uid).single();

      if (data) {
        const mapped = mapProfileRow(data, session);
        profileFor.current = uid;
        writeProfileCache(mapped);
        setUser(mapped);
        setLoaded(true);
        return;
      }
      // PGRST116 = no row yet (genuinely new user / trigger delay). Keep the
      // minimal/cached profile and stop — retrying won't conjure a row.
      if (error && error.code === "PGRST116") return;

      // Transient failure (network blip / DB IO timeout) → short backoff, retry.
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
    // All retries failed: keep cache/minimal state; self-heals on the next event.
  }, [supabase]);

  useEffect(() => {
    // Hydrate from existing session on first render
    supabase.auth.getSession().then(
      (result: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
        loadProfile(result.data.session);
      }
    );

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (event === "SIGNED_OUT") {
          // A refresh-token race (e.g. two tabs refreshing at once) or a transient
          // rejection can emit a SPURIOUS SIGNED_OUT. Re-check storage before
          // tearing down the UI: if a valid session is still present (another tab
          // refreshed it), keep the user logged in instead of bouncing them out.
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) { loadProfile(data.session); return; }
          profileFor.current = null;
          setUser(null);
          setLoaded(true);
          return;
        }
        // A token refresh rotates the access token but the profile is unchanged.
        // loadProfile() short-circuits when we already hold the profile, avoiding
        // churn. USER_UPDATED is the one case that needs a forced refetch.
        loadProfile(session, event === "USER_UPDATED");
      }
    );

    // Returning to the tab after idle: the access token may have expired while
    // hidden. Proactively reconcile — getSession() refreshes the token when
    // needed; if the session is still valid we stay logged in rather than
    // waiting for an event. Never forces a logout (only restores a valid session).
    function onVisible() {
      if (typeof document === "undefined" || document.visibilityState !== "visible") return;
      supabase.auth.getSession().then((res: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
        if (res.data.session?.user) loadProfile(res.data.session);
      });
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [supabase, loadProfile]);

  // ── OTP provider switch ─────────────────────────────────────────────────────
  // TEMPORARY: OTP Space is down, so OTP is routed through Fazpass again
  // (Supabase phone OTP → Send-SMS hook → /api/auth/send-otp → Fazpass gateway).
  // To restore OTP Space, set USE_FAZPASS = false — nothing else changes: the OTP
  // Space endpoints (/api/otp/start, /api/otp/check), src/lib/otpspace.ts,
  // src/lib/otpAuth.ts, and OTPSPACE_API_KEY all remain in place and untouched.
  const USE_FAZPASS: boolean = true;

  // ── sendOtp ───────────────────────────────────────────────────────────────
  async function sendOtp(phone: string): Promise<{ error?: string }> {
    if (USE_FAZPASS) {
      // Supabase generates the OTP; its Send-SMS hook forwards it to Fazpass.
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizePhone(phone),
        options: { shouldCreateUser: true },
      });
      return error ? { error: error.message } : {};
    }
    // OTP Space (WhatsApp) via /api/otp/start.
    try {
      const res = await fetch("/api/otp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        return { error: d.error || "Gagal mengirim kode. Coba lagi." };
      }
      return {};
    } catch {
      return { error: "Gagal mengirim kode. Coba lagi." };
    }
  }

  // ── verifyOtp ─────────────────────────────────────────────────────────────
  async function verifyOtp(
    phone: string,
    code: string,
  ): Promise<{ error?: string; isNewUser?: boolean }> {
    if (USE_FAZPASS) {
      // Supabase verifies its own OTP and establishes the session directly.
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizePhone(phone),
        token: code,
        type:  "sms",
      });
      if (error) return { error: error.message };
      let isNew = true;
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles").select("name").eq("id", data.user.id).single();
        isNew = !prof?.name;
      }
      return { isNewUser: isNew };
    }
    // OTP Space (/api/otp/check) → server mints a Supabase session we install here.
    try {
      const res = await fetch("/api/otp/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { error: d.error || "Kode salah atau sudah kedaluwarsa." };
      }
      const { error } = await supabase.auth.setSession({
        access_token:  d.access_token,
        refresh_token: d.refresh_token,
      });
      if (error) return { error: error.message };
      return { isNewUser: d.isNewUser };
    } catch {
      return { error: "Terjadi kesalahan. Coba lagi." };
    }
  }

  // ── register (save / overwrite profile) ──────────────────────────────────
  async function register(
    data: Omit<UserData, "id" | "tier" | "lifetime" | "premiumExpiresAt">,
  ): Promise<{ error?: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: "Not authenticated" };

    // Only write fields the caller actually provided, so an omitted field can
    // never null out saved data (e.g. a returning user's kids/DOB/address).
    const patch: Record<string, unknown> = {};
    if (data.name       !== undefined) patch.name        = data.name       || null;
    if (data.dob        !== undefined) patch.dob         = data.dob        || null;
    if (data.kids       !== undefined) patch.kids        = data.kids;
    if (data.address    !== undefined) patch.address     = data.address    || null;
    if (data.addressLat !== undefined) patch.address_lat = data.addressLat || null;
    if (data.addressLng !== undefined) patch.address_lng = data.addressLng || null;

    if (Object.keys(patch).length) {
      const { error } = await supabase.from("profiles").update(patch).eq("id", session.user.id);
      if (error) return { error: error.message };
    }

    // Keep local photo in localStorage keyed by user ID until Phase 2 Storage migration
    if (data.avatar) localStorage.setItem(`profilePhoto_${session.user.id}`, data.avatar);

    await loadProfile(session, true);
    return {};
  }

  // ── updateUser (partial update) ───────────────────────────────────────────
  async function updateUser(
    data: Partial<Omit<UserData, "id" | "tier" | "lifetime" | "premiumExpiresAt">>,
  ): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const patch: Record<string, unknown> = {};
    if (data.name        !== undefined) patch.name        = data.name || null;
    if (data.dob         !== undefined) patch.dob         = data.dob  || null;
    if (data.kids        !== undefined) patch.kids        = data.kids;
    if (data.address     !== undefined) patch.address     = data.address    || null;
    if (data.addressLat  !== undefined) patch.address_lat = data.addressLat || null;
    if (data.addressLng  !== undefined) patch.address_lng = data.addressLng || null;

    if (Object.keys(patch).length) {
      await supabase.from("profiles").update(patch).eq("id", session.user.id);
    }
    if (data.avatar) localStorage.setItem(`profilePhoto_${session.user.id}`, data.avatar);
    await loadProfile(session, true);
  }

  // ── logout ────────────────────────────────────────────────────────────────
  async function logout(): Promise<void> {
    // Clear local UI state first so the app reflects logout even if the network
    // signOut is slow or fails.
    profileFor.current = null;
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[logout] signOut failed:", e);
    }
    ["savedIds", "compareIds", "userReviews", "facilityNotes"]
      .forEach(k => localStorage.removeItem(k));
    // profilePhoto_<userId> is intentionally kept — survives logout so the same user
    // doesn't have to re-upload their photo on every login.
  }

  // ── upgradeToPremium (no-op for soft launch) ──────────────────────────────
  function upgradeToPremium(_lifetime = false) {
    console.warn("upgradeToPremium: premium tier is not active in this build");
  }

  const tier: Tier        = user?.tier === "premium" ? "premium" : "free";
  const isRegistered      = !!(user?.name); // requires completed profile

  return (
    <AuthContext.Provider value={{
      user, tier, isRegistered, loaded,
      sendOtp, verifyOtp, register, updateUser, logout, upgradeToPremium,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
