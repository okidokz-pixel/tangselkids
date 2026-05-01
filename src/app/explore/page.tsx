"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Search, X, GraduationCap, BookOpen, Baby, TreePine,
  Stethoscope, Coffee, PawPrint, Waves, BookMarked, LayoutGrid,
} from "lucide-react";
import { places, getAreaGroup } from "@/lib/mockData";
import { useLang } from "@/context/LanguageContext";
import { PlaceCard } from "@/components/PlaceCard";
import { AreaToggle, type AreaFilter } from "@/components/AreaToggle";
import { BottomNav } from "@/components/BottomNav";

type Cat =
  | "all" | "school" | "learning-center" | "daycare" | "playground"
  | "clinic" | "cafe" | "mini-zoo" | "swimming-pool" | "bookstore";

export default function ExplorePage() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [cat,   setCat]   = useState<Cat>("all");
  const [area,  setArea]  = useState<AreaFilter>("all");

  const categories: { value: Cat; label: string; Icon: React.ElementType }[] = [
    { value: "all",             label: t.exploreAllCats,       Icon: LayoutGrid    },
    { value: "school",          label: t.exploreSchools,       Icon: GraduationCap },
    { value: "learning-center", label: t.exploreLCs,           Icon: BookOpen      },
    { value: "daycare",         label: t.exploreDaycare,       Icon: Baby          },
    { value: "playground",      label: t.explorePlaygrounds,   Icon: TreePine      },
    { value: "clinic",          label: t.exploreClinics,       Icon: Stethoscope   },
    { value: "cafe",            label: t.exploreCafes,         Icon: Coffee        },
    { value: "mini-zoo",        label: t.exploreMiniZoo,       Icon: PawPrint      },
    { value: "swimming-pool",   label: t.exploreSwimmingPools, Icon: Waves         },
    { value: "bookstore",       label: t.exploreBookstores,    Icon: BookMarked    },
  ];

  const filtered = places.filter((p) => {
    const matchCat   = cat === "all" || p.category === cat;
    const matchArea  = area === "all" || getAreaGroup(p.area) === area;
    const q          = query.toLowerCase();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || p.area.toLowerCase().includes(q);
    return matchCat && matchArea && matchQuery;
  });

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-28">

      {/* Header */}
      <div
        className="px-5 pt-12 pb-5"
        style={{
          background: "linear-gradient(160deg, #0F1E3C 0%, #1A3A6C 60%, #2563EB 100%)",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <div className="mb-4">
          <p className="text-[#93C5FD] text-xs font-jakarta font-semibold tracking-widest uppercase">TangselKids</p>
          <h1 className="text-white text-3xl font-bold leading-tight mt-0.5"
              style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>
            {t.exploreTitle}
          </h1>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg"
             style={{ background: "#fff" }}>
          <Search size={18} strokeWidth={2} style={{ color: "var(--tk-blue-700)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.exploreSearch}
            className="flex-1 text-sm text-gray-600 outline-none placeholder-gray-400 font-jakarta bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 flex-shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          {categories.map((c) => {
            const isActive = cat === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setCat(c.value)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-jakarta font-semibold border transition-all"
                style={
                  isActive
                    ? { background: "var(--tk-ink)", color: "#fff", borderColor: "var(--tk-ink)" }
                    : { background: "#fff", color: "var(--tk-muted)", borderColor: "var(--tk-line)" }
                }
              >
                <c.Icon size={13} strokeWidth={2} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Area toggle */}
        <AreaToggle value={area} onChange={setArea} />

        {/* Results count */}
        <p className="text-xs font-jakarta" style={{ color: "var(--tk-muted)" }}>{t.exploreResults(filtered.length)}</p>

        {/* Cards */}
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search size={40} className="mx-auto mb-3" style={{ color: "var(--tk-line)" }} />
              <p className="font-jakarta text-sm" style={{ color: "var(--tk-muted)" }}>{t.exploreNoResults}</p>
            </div>
          )}
          {filtered.map((place) => (
            <Link key={place.id} href={`/place/${place.id}`} style={{ textDecoration: "none", display: "block" }}>
              <PlaceCard place={place} />
            </Link>
          ))}
        </div>
      </div>

      <BottomNav active="explore" />
    </div>
  );
}
