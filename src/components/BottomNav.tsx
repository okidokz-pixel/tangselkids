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

  // Read the PREVIOUS tab from sessionStorage synchronously inside the useState
  // initializer — this way the very first render already paints the pill at the
  // old position, giving the slide animation a real "from" point.
  const [pillIndex, setPillIndex] = useState<number>(() => {
    if (typeof window === "undefined") return activeIndex;
    const stored = sessionStorage.getItem("navTabIndex");
    if (stored === null) return activeIndex;
    const prev = parseInt(stored, 10);
    return prev >= 0 && prev < TAB_IDS.length ? prev : activeIndex;
  });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Persist the current tab for the next navigation
    sessionStorage.setItem("navTabIndex", String(activeIndex));

    // Double-rAF: ensures the browser has actually painted the pill at its
    // starting position before we move it (triggering the CSS transition).
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setPillIndex(activeIndex);
        setAnimate(true);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
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
