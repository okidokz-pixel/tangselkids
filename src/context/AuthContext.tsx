"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Kid = { name: string; dob: string; gender?: "male" | "female" };

export type UserData = {
  phone: string;
  name: string;
  address: string;
  addressLat?: number;
  addressLng?: number;
  dob?: string;
  kids: Kid[];
  avatar?: string; // kept for home-alt compatibility; no UI to set it on the main site
  tier?: "free" | "premium";
  lifetime?: boolean;        // true = lifetime member, premiumExpiresAt is ignored
  premiumExpiresAt?: string; // ISO date string — undefined for lifetime members
};

export type Tier = "free" | "premium";

type AuthContextType = {
  user: UserData | null;
  tier: Tier;
  isRegistered: boolean;
  loaded: boolean;
  register: (data: UserData) => void;
  login: (phone: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
  upgradeToPremium: (lifetime?: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null, tier: "free", isRegistered: false, loaded: false,
  register: () => {}, login: () => false, logout: () => {},
  upgradeToPremium: (_lifetime?: boolean) => {}, updateUser: () => {},
});

function computeTier(user: UserData | null): Tier {
  if (!user) return "free";
  if (user.tier === "premium") {
    if (user.lifetime) return "premium";
    if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()) return "premium";
  }
  return "free";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tkUser");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  function register(data: UserData) {
    const existing = user;
    const merged: UserData = {
      ...data,
      tier: data.tier ?? existing?.tier ?? "free",
      lifetime: data.lifetime ?? existing?.lifetime,
      premiumExpiresAt: data.premiumExpiresAt ?? existing?.premiumExpiresAt,
    };
    // Persist to active session
    localStorage.setItem("tkUser", JSON.stringify(merged));
    setUser(merged);
    // Persist to registry so login() can find this user later
    try {
      const registry = JSON.parse(localStorage.getItem("tkUsers") || "{}");
      const normalized = data.phone.replace(/\D/g, "");
      registry[normalized] = merged;
      localStorage.setItem("tkUsers", JSON.stringify(registry));
    } catch {}
  }

  function login(phone: string): boolean {
    try {
      const registry = JSON.parse(localStorage.getItem("tkUsers") || "{}");
      const normalized = phone.replace(/\D/g, "");
      const userData: UserData | undefined = registry[normalized] ?? registry[phone];
      if (userData) {
        localStorage.setItem("tkUser", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
    } catch {}
    return false;
  }

  function updateUser(data: Partial<UserData>) {
    if (!user) return;
    const updated = { ...user, ...data };
    localStorage.setItem("tkUser", JSON.stringify(updated));
    setUser(updated);
    try {
      const registry = JSON.parse(localStorage.getItem("tkUsers") || "{}");
      const normalized = user.phone.replace(/\D/g, "");
      registry[normalized] = updated;
      localStorage.setItem("tkUsers", JSON.stringify(registry));
    } catch {}
  }

  function logout() {
    localStorage.removeItem("tkUser");
    localStorage.removeItem("savedIds");
    localStorage.removeItem("compareIds");
    localStorage.removeItem("userReviews");
    localStorage.removeItem("profilePhoto");
    localStorage.removeItem("facilityNotes");
    setUser(null);
  }

  function upgradeToPremium(lifetime = false) {
    const updated: UserData = lifetime
      ? { ...(user as UserData), tier: "premium", lifetime: true, premiumExpiresAt: undefined }
      : (() => {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          return { ...(user as UserData), tier: "premium", lifetime: undefined, premiumExpiresAt: expiry.toISOString() };
        })();
    localStorage.setItem("tkUser", JSON.stringify(updated));
    setUser(updated);
  }

  const tier = computeTier(user);

  return (
    <AuthContext.Provider value={{ user, tier, isRegistered: !!user, loaded, register, login, logout, upgradeToPremium, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
