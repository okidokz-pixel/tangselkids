"use client";
import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
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
  /** Verify the 6-digit OTP. Returns isNewUser=true when the profile has no name yet */
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser]     = useState<UserData | null>(null);
  const [loaded, setLoaded] = useState(false);

  /** Fetch profile row and set user state from a Supabase session */
  const loadProfile = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setLoaded(true);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const localPhoto =
      typeof window !== "undefined"
        ? (localStorage.getItem("profilePhoto") ?? undefined)
        : undefined;

    if (data) {
      setUser({
        id:               data.id,
        phone:            data.phone            ?? session.user.phone ?? "",
        name:             data.name             ?? "",
        address:          data.address          ?? undefined,
        addressLat:       data.address_lat      ?? undefined,
        addressLng:       data.address_lng      ?? undefined,
        dob:              data.dob              ?? undefined,
        kids:             (data.kids as Kid[])  ?? [],
        avatar:           localPhoto,
        avatarUrl:        data.avatar_url       ?? undefined,
        tier:             (data.tier as "free" | "premium") ?? "free",
        lifetime:         data.lifetime         ?? false,
        premiumExpiresAt: data.premium_expires_at ?? undefined,
      });
    } else {
      // Handle trigger delay — profile row may not exist yet
      setUser({
        id:    session.user.id,
        phone: session.user.phone ?? "",
        name:  "",
        kids:  [],
      });
    }
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    // Hydrate from existing session on first render
    supabase.auth.getSession().then(
      (result: Awaited<ReturnType<typeof supabase.auth.getSession>>) => {
        loadProfile(result.data.session);
      }
    );

    // Keep state in sync across session changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        void event;
        loadProfile(session);
      }
    );
    return () => subscription.unsubscribe();
  }, [supabase, loadProfile]);

  // ── sendOtp ───────────────────────────────────────────────────────────────
  async function sendOtp(phone: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizePhone(phone),
      options: { shouldCreateUser: true },
    });
    return error ? { error: error.message } : {};
  }

  // ── verifyOtp ─────────────────────────────────────────────────────────────
  async function verifyOtp(
    phone: string,
    code: string,
  ): Promise<{ error?: string; isNewUser?: boolean }> {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizePhone(phone),
      token: code,
      type:  "sms",
    });
    if (error) return { error: error.message };

    // Check whether this user already has a named profile
    let isNew = true;
    if (data.user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", data.user.id)
        .single();
      isNew = !prof?.name;
    }
    return { isNewUser: isNew };
  }

  // ── register (save / overwrite profile) ──────────────────────────────────
  async function register(
    data: Omit<UserData, "id" | "tier" | "lifetime" | "premiumExpiresAt">,
  ): Promise<{ error?: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update({
        name:        data.name        ?? null,
        dob:         data.dob         ?? null,
        kids:        data.kids        ?? [],
        address:     data.address     ?? null,
        address_lat: data.addressLat  ?? null,
        address_lng: data.addressLng  ?? null,
      })
      .eq("id", session.user.id);

    if (error) return { error: error.message };

    // Keep local photo in localStorage until Phase 2 Storage migration
    if (data.avatar) localStorage.setItem("profilePhoto", data.avatar);

    await loadProfile(session);
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
    if (data.avatar) localStorage.setItem("profilePhoto", data.avatar);
    await loadProfile(session);
  }

  // ── logout ────────────────────────────────────────────────────────────────
  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    ["savedIds", "compareIds", "userReviews", "profilePhoto", "facilityNotes"]
      .forEach(k => localStorage.removeItem(k));
    setUser(null);
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
