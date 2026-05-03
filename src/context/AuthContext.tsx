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

export type Tier = "guest" | "free" | "registered" | "premium";

type AuthContextType = {
  user: UserData | null;
  tier: Tier;
  isRegistered: boolean;
  loaded: boolean;
  register: (data: UserData) => void;
  logout: () => void;
  upgradeToPremium: (lifetime?: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null, tier: "guest", isRegistered: false, loaded: false,
  register: () => {}, logout: () => {}, upgradeToPremium: (_lifetime?: boolean) => {},
});

function computeTier(user: UserData | null): Tier {
  if (!user) return "free";              // anonymous
  if (user.tier === "premium") {
    if (user.lifetime) return "premium";
    if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()) return "premium";
  }
  return "registered";                   // logged-in free = Terdaftar
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
    // Preserve existing tier/expiry if not explicitly set in new data
    const existing = user;
    const merged: UserData = {
      ...data,
      tier: data.tier ?? existing?.tier ?? "free",
      premiumExpiresAt: data.premiumExpiresAt ?? existing?.premiumExpiresAt,
    };
    localStorage.setItem("tkUser", JSON.stringify(merged));
    setUser(merged);
  }

  function logout() {
    localStorage.removeItem("tkUser");
    localStorage.removeItem("savedIds");
    localStorage.removeItem("compareIds");
    localStorage.removeItem("userReviews");
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
    <AuthContext.Provider value={{ user, tier, isRegistered: !!user, loaded, register, logout, upgradeToPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
