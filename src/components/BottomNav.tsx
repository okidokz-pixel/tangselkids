"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Search, Bookmark, User } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export type NavTab = "home" | "explore" | "saved" | "profile";
const TAB_IDS: NavTab[] = ["home", "explore", "saved", "profile"];

export function BottomNav({ active }: { active: NavTab }) {
  const { t } = useLang();
  const activeIndex = TAB_IDS.indexOf(active);

  // Always start at activeIndex so SSR and client first render match (no hydration mismatch).
  // After mount, we slide from the previously stored tab to activeIndex.
  const [pillIndex, setPillIndex] = useState<number>(activeIndex);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Read previous tab from sessionStorage after mount (safe — no SSR/client mismatch).
    const stored = sessionStorage.getItem("navTabIndex");
    const prev = stored !== null ? parseInt(stored, 10) : activeIndex;
    const prevIndex = prev >= 0 && prev < TAB_IDS.length ? prev : activeIndex;

    // Persist current tab for next navigation.
    sessionStorage.setItem("navTabIndex", String(activeIndex));

    if (prevIndex === activeIndex) return;

    // Snap pill to previous position, then animate to current on next paint.
    // No cleanup/cancelAnimationFrame: React Strict Mode double-invokes effects and
    // cancels the first run's rAFs before they fire, leaving the pill frozen.
    // Letting rAFs fire after a potential remount is safe in React 18.
    setPillIndex(prevIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPillIndex(activeIndex);
        setAnimate(true);
      });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      zIndex: 50,
    }}>
      {/* position:relative wrapper so the absolute pill is contained correctly */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>

        {/* Sliding pill */}
        <div style={{
          position: "absolute",
          top: 0, bottom: 0,
          width: "25%",
          left: `${pillIndex * 25}%`,
          background: "#0e1d4f",
          borderRadius: 22,
          transition: animate ? "left 0.38s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          pointerEvents: "none",
        }} />

        {tabs.map(({ id, href, label, Icon }) => {
          const isActive = id === active;
          return (
            <Link key={id} href={href} style={{
              flex: 1, padding: "8px 6px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              textDecoration: "none",
              color: isActive ? "#fff" : "#64748b",
              fontSize: 11, fontWeight: 700,
              position: "relative", zIndex: 1,
              transition: "color 0.38s ease",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}>
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}

      </div>
    </nav>
  );
}
