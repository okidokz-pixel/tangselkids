"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Search, Bookmark, User } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export type NavTab = "home" | "explore" | "saved" | "profile";

// Pill left positions for each of the 4 equal grid columns.
// Formula: left(n) = 6px padding + n * ((100% - 24px) / 4 + 4px gap)
//                  = calc(n*25% + (6 - n*2)px)
// All four are explicitly written as calc(X% + Ypx) so Safari treats them
// as the same interpolation type and can animate between any pair.
const PILL_LEFTS: Record<number, string> = {
  0: "calc(0.01% + 6px)",   // ≈ 6px  — 0.01% keeps it as mixed-type for Safari
  1: "calc(25% + 4px)",
  2: "calc(50% + 2px)",
  3: "calc(75% + 0.01px)",  // ≈ 75% — 0.01px keeps it as mixed-type for Safari
};
const PILL_WIDTH = "calc(25% - 6px)";

const TAB_IDS: NavTab[] = ["home", "explore", "saved", "profile"];
const STORAGE_KEY = "tkLastNavIndex";

export function BottomNav({ active }: { active: NavTab }) {
  const { t } = useLang();

  const items = [
    { id: "home"    as const, Icon: Home,     label: t.navHome,    href: "/"        },
    { id: "explore" as const, Icon: Search,   label: t.navExplore, href: "/explore" },
    { id: "saved"   as const, Icon: Bookmark, label: t.navSaved,   href: "/saved"   },
    { id: "profile" as const, Icon: User,     label: t.navProfile, href: "/profile" },
  ];

  const activeIndex = TAB_IDS.indexOf(active);

  // Initialise pill at the PREVIOUS tab's position so it can slide to the new one.
  const [pillIndex, setPillIndex] = useState<number>(() => {
    if (typeof window === "undefined") return activeIndex;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored !== null ? parseInt(stored, 10) : activeIndex;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Two separate rAFs — ORDER MATTERS:
    //   rAF1: enable transition first (pill still at "from" position)
    //   rAF2: THEN move pill — CSS now sees an already-enabled transition and fires it
    // Putting both in the same frame means CSS sees transition+position change
    // simultaneously and skips the animation (Safari/WebKit bug).
    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      setReady(true); // ← transition ON, position unchanged
      raf2 = requestAnimationFrame(() => {
        setPillIndex(activeIndex); // ← position changes NOW → transition fires
        try { sessionStorage.setItem(STORAGE_KEY, String(activeIndex)); } catch {}
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [activeIndex]);

  return (
    <nav style={{
      position: "fixed",
      bottom: 14,
      left: 14,
      right: 14,
      margin: "0 auto",
      width: "auto",
      maxWidth: 420,
      zIndex: 50,
      borderRadius: 28,
      padding: 6,
      background: "#fff",
      border: "1px solid var(--tk-line)",
      boxShadow: "0 18px 40px rgba(15,23,42,0.12), 0 1px 0 rgba(15,23,42,0.04)",
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 4,
    }}>

      {/* Sliding pill */}
      <div style={{
        position: "absolute",
        top: 6,
        bottom: 6,
        left: PILL_LEFTS[pillIndex],
        width: PILL_WIDTH,
        background: "#0f172a",
        borderRadius: 22,
        zIndex: 0,
        pointerEvents: "none",
        // Transition is only enabled AFTER the first paint (double rAF ensures this).
        transition: ready ? "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
      }} />

      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              textDecoration: "none",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{
              color: isActive ? "#fff" : "var(--tk-muted)",
              borderRadius: 22,
              padding: "10px 4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: -0.1,
            }}>
              <item.Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
