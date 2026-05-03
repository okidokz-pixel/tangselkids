"use client";
import Link from "next/link";
import { Home, Search, Bookmark, User } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export type NavTab = "home" | "explore" | "saved" | "profile";

export function BottomNav({ active }: { active: NavTab }) {
  const { t } = useLang();

  const tabs = [
    { id: "home"    as NavTab, href: "/",        label: t.navHome,    Icon: Home     },
    { id: "explore" as NavTab, href: "/explore", label: t.navExplore, Icon: Search   },
    { id: "saved"   as NavTab, href: "/saved",   label: t.navSaved,   Icon: Bookmark },
    { id: "profile" as NavTab, href: "/profile", label: t.navProfile, Icon: User     },
  ];

  return (
    <nav style={{
      position: "fixed",
      bottom: 14, left: 14, right: 14,
      margin: "0 auto", maxWidth: 420,
      background: "#fff", borderRadius: 28, padding: 6,
      border: "1px solid rgba(15,23,42,0.08)",
      boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
      display: "flex", alignItems: "center",
      zIndex: 50,
    }}>
      {tabs.map(({ id, href, label, Icon }) => {
        const isActive = id === active;
        return (
          <Link key={id} href={href} style={{
            flex: 1, padding: "8px 6px", textAlign: "center", borderRadius: 22,
            background: isActive ? "#0e1d4f" : "transparent",
            color: isActive ? "#fff" : "#64748b",
            fontSize: 11, fontWeight: 700,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            textDecoration: "none",
            transition: "background .25s ease, color .25s ease",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}>
            <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
