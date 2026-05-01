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
  avatar?: string; // "avatar_0"–"avatar_7" or "data:image/jpeg;base64,…"
  tier?: "free" | "premium";
  premiumExpiresAt?: string; // ISO date string
};

export type Tier = "guest" | "free" | "premium";

type AuthContextType = {
  user: UserData | null;
  tier: Tier;
  isRegistered: boolean;
  loaded: boolean;
  register: (data: UserData) => void;
  logout: () => void;
  upgradeToPremium: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null, tier: "guest", isRegistered: false, loaded: false,
  register: () => {}, logout: () => {}, upgradeToPremium: () => {},
});

function computeTier(user: UserData | null): Tier {
  if (!user) return "guest";
  if (user.tier === "premium" && user.premiumExpiresAt) {
    if (new Date(user.premiumExpiresAt) > new Date()) return "premium";
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

  function upgradeToPremium() {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const updated: UserData = {
      ...(user as UserData),
      tier: "premium",
      premiumExpiresAt: expiry.toISOString(),
    };
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
