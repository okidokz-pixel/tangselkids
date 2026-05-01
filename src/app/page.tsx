"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAvatarMeta } from "@/lib/avatars";
import {
  Search, MapPin,
  GraduationCap, BookOpen, Baby, TreePine,
  Stethoscope, Coffee, PawPrint, Waves, BookMarked, Sparkles,
  ArrowRight, Home as HomeIcon, Bookmark, User, Clock,
  type LucideIcon,
} from "lucide-react";
import { articles } from "@/lib/articles";
import { useLang } from "@/context/LanguageContext";
import { LangToggle } from "@/components/LangToggle";
import { places } from "@/lib/mockData";

// First 4 places for the featured 2×2 grid
const featured = places.slice(0, 4);

function formatPrice(priceMin: number): string {
  if (priceMin === 0) return "Gratis";
  if (priceMin >= 1_000_000) return `${(priceMin / 1_000_000).toFixed(1)}jt`;
  return `${(priceMin / 1_000).toFixed(0)}k`;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SectionHead({
  kicker, title, link, linkHref,
}: {
  kicker: string; title: string; link?: string; linkHref?: string;
}) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
        color: "var(--tk-blue-700)", textTransform: "uppercase",
      }}>{kicker}</div>
      <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h2 style={{
          margin: 0, fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 28, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.05,
          color: "var(--tk-ink)",
        }}>{title}</h2>
        {link && linkHref && (
          <Link href={linkHref} style={{ fontSize: 12, color: "var(--tk-muted)", fontWeight: 600, textDecoration: "none" }}>
            {link}
          </Link>
        )}
        {link && !linkHref && (
          <span style={{ fontSize: 12, color: "var(--tk-muted)", fontWeight: 600 }}>{link}</span>
        )}
      </div>
    </div>
  );
}

function PaperTile({
  href, label, Icon, tint, border, plus,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  tint: string;
  border: string;
  plus?: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div className="press-tile" style={{
        aspectRatio: "1/1",
        borderRadius: 20,
        background: tint,
        border: `1px solid ${border}33`,
        padding: 12,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        overflow: "clip",
        boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 10px rgba(15,23,42,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 13,
            background: "#fff", border: `1px solid ${border}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon size={22} color={border} strokeWidth={1.75} />
          </div>
          {plus && (
            <div style={{
              width: 26, height: 26, borderRadius: 999,
              background: "#fff", border: `1px solid ${border}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: border, fontSize: 14, fontWeight: 700,
            }}>+</div>
          )}
        </div>
        <div>
          <div style={{
            fontSize: 15, fontWeight: 600, letterSpacing: -0.3,
            color: "var(--tk-ink)",
            fontFamily: "var(--font-fraunces), Georgia, serif",
            lineHeight: 1.2,
          }}>{label}</div>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function HomePage() {
  const { t } = useLang();
  const router = useRouter();
  const { user } = useAuth();
  const avatarMeta = getAvatarMeta(user?.avatar);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("justRegistered")) {
      sessionStorage.removeItem("justRegistered");
      setShowReveal(true);
    }
  }, []);

  return (
    <div style={{ background: "#EFF6FF", minHeight: "100vh", position: "relative" }}>

      {/* ── Tap-effect styles ─────────────────────────────────────────── */}
      <style>{`
        /* Banner cards (Schools, Learning Centers) */
        .press-banner {
          transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.18s ease;
        }
        a:active .press-banner {
          transform: scale(0.965);
          box-shadow: 0 4px 12px rgba(15,23,42,0.10) !important;
        }

        /* Paper tiles (3-col grid) */
        .press-tile {
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
                      filter 0.15s ease;
        }
        a:active .press-tile {
          transform: scale(0.91);
          filter: brightness(0.90);
        }

        /* Featured photo cards */
        .press-photo {
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.22s ease;
          display: block;
        }
        .press-photo:active {
          transform: scale(1.03);
          box-shadow: 0 18px 40px rgba(15,23,42,0.28) !important;
        }
        .press-photo .photo-img {
          transition: transform 0.35s ease;
        }
        .press-photo:active .photo-img {
          transform: scale(1.09);
        }
      `}</style>

      {/* ── Curtain reveal overlay ─────────────────────────────────────── */}
      {showReveal && (
        <>
          <style>{`
            @keyframes curtainRise {
              0%   { transform: translateY(0); }
              100% { transform: translateY(100%); }
            }
          `}</style>
          <div
            onAnimationEnd={() => setShowReveal(false)}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(160deg, #0F1E3C 0%, #1A3A6C 60%, #0a1628 100%)",
              zIndex: 9999,
              animation: "curtainRise 0.9s cubic-bezier(0.76, 0, 0.24, 1) 0.15s both",
            }}
          />
        </>
      )}

      {/* scrollable content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 448, margin: "0 auto", paddingBottom: 110 }}>
        {/* ══════════════════════════════════
            HERO PANEL
        ══════════════════════════════════ */}
        <div style={{ padding: "14px 14px 0" }}>
          <div style={{
            position: "relative", overflow: "clip",
            borderRadius: 32,
            background: "linear-gradient(170deg, #1e3fb0 0%, #2a4fd8 60%, #3a64ee 100%)",
            color: "#fff", padding: "18px 20px 28px",
            boxShadow: "0 18px 40px rgba(30,63,176,0.28), 0 1px 0 rgba(255,255,255,0.18) inset",
            minHeight: 300,
          }}>

            {/* decorative orbits */}
            <svg aria-hidden width="320" height="320" viewBox="0 0 320 320" style={{
              position: "absolute", right: -90, top: -90, opacity: 0.18, pointerEvents: "none",
            }}>
              <circle cx="160" cy="160" r="70"  stroke="#fff" strokeWidth="1" fill="none"/>
              <circle cx="160" cy="160" r="105" stroke="#fff" strokeWidth="1" fill="none"/>
              <circle cx="160" cy="160" r="140" stroke="#fff" strokeWidth="1" fill="none"/>
              <circle cx="240" cy="100" r="6" fill="#f6b545"/>
              <circle cx="80"  cy="220" r="4" fill="#7af0b6"/>
            </svg>

            {/* hero image — positioned bottom-right, overflows top */}
            <img
              src="/hero.png"
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                height: "74%",
                width: "auto",
                objectFit: "contain",
                objectPosition: "bottom right",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />

            {/* top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 11px", borderRadius: 999,
                background: "rgba(0,0,0,0.18)",
                border: "0.5px solid rgba(255,255,255,0.18)",
                fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: "#7af0b6", flexShrink: 0 }}/>
                BINTARO · TANGSEL
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <LangToggle />
                <button
                  onClick={() => router.push("/profile")}
                  onTouchEnd={(e) => { e.preventDefault(); router.push("/profile"); }}
                  style={{
                    width: 32, height: 32, borderRadius: 999,
                    background: avatarMeta ? (avatarMeta.type === "emoji" ? avatarMeta.bg : "transparent") : "linear-gradient(135deg,#f6b545,#e26a4f)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid rgba(255,255,255,0.4)",
                    cursor: "pointer", flexShrink: 0,
                    touchAction: "manipulation", overflow: "clip",
                    padding: 0,
                  }}
                >
                  {avatarMeta?.type === "photo" ? (
                    <img src={avatarMeta.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  ) : avatarMeta?.type === "emoji" ? (
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{avatarMeta.emoji}</span>
                  ) : (
                    <User size={16} color="#3a2304" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* wordmark — constrained to left half so image has room */}
            <div style={{ marginTop: 22, position: "relative", zIndex: 1, maxWidth: "55%" }}>
              <h1 style={{
                margin: "4px 0 0",
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 52, lineHeight: 0.95, fontWeight: 600, letterSpacing: -2,
              }}>
                Tangsel<span style={{ color: "#f6b545" }}>.</span>
              </h1>
              <div style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontStyle: "italic", fontSize: 22, lineHeight: 1,
                opacity: 0.85, marginTop: 2, fontWeight: 400,
              }}>
                Kids
              </div>
            </div>

            <p style={{
              margin: "14px 0 0", fontSize: 13.5, opacity: 0.82, lineHeight: 1.45,
              maxWidth: "55%", position: "relative", zIndex: 1,
            }}>
              {t.homeHeroDesc}
            </p>

            {/* total count stat — pinned to bottom-left */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              position: "absolute", bottom: 22, left: 20, zIndex: 1,
            }}>
              <span style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 24, fontWeight: 600, color: "#f6b545",
              }}>{places.length}+</span>
              <span style={{ fontSize: 13, opacity: 0.82, fontWeight: 600 }}>
                {t.homeStatTotal}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            01 — KATEGORI
        ══════════════════════════════════ */}
        <div style={{ padding: "28px 18px 0" }}>
          <SectionHead
            kicker={t.homeCategoryKicker}
            title={t.homeBrowseTitle}
          />

          {/* Category row cards */}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Schools */}
            <Link href="/schools" style={{ textDecoration: "none" }}>
              <div className="press-banner" style={{
                borderRadius: 22, padding: 16,
                background: "linear-gradient(135deg,#1e3fb0,#3a64ee)", color: "#fff",
                display: "flex", alignItems: "center", gap: 14,
                position: "relative", overflow: "clip",
                boxShadow: "0 12px 28px rgba(15,23,42,0.12), 0 1px 0 rgba(255,255,255,0.18) inset",
              }}>
                <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 4, background: "#f6b545" }} />
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <GraduationCap size={26} color="#fff" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: 24, fontWeight: 600, letterSpacing: -0.3,
                  }}>{t.schoolsTitle}</div>
                  <div style={{ fontSize: 12, opacity: 0.78, marginTop: 2, lineHeight: 1.4 }}>
                    {t.homeSchoolsDesc}
                  </div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: "#fff", color: "#1e3fb0",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              </div>
            </Link>

            {/* Learning Centers */}
            <Link href="/learning-centers" style={{ textDecoration: "none" }}>
              <div className="press-banner" style={{
                borderRadius: 22, padding: 16,
                background: "linear-gradient(135deg,#2a7d62,#1f9b6a)", color: "#fff",
                display: "flex", alignItems: "center", gap: 14,
                position: "relative", overflow: "clip",
                boxShadow: "0 12px 28px rgba(15,23,42,0.12), 0 1px 0 rgba(255,255,255,0.18) inset",
              }}>
                <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 4, background: "#7af0b6" }} />
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <BookOpen size={26} color="#fff" strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: 24, fontWeight: 600, letterSpacing: -0.3,
                  }}>{t.homeLCTitle}</div>
                  <div style={{ fontSize: 12, opacity: 0.78, marginTop: 2, lineHeight: 1.4 }}>
                    {t.homeLCDesc}
                  </div>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: "#fff", color: "#1f9b6a",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          </div>

          {/* Paper tile grid — 8 tiles uniform 3-col */}
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            <PaperTile href="/daycare"        label={t.homeDaycareTitle}    Icon={Baby}        tint="#fde2c8" border="#f6b545" />
            <PaperTile href="/playgrounds"    label={t.homePlaygroundTitle} Icon={TreePine}    tint="#d4ead7" border="#1f9b6a" />
            <PaperTile href="/clinics"        label={t.homeClinics}         Icon={Stethoscope} tint="#fbe1ea" border="#e26a8a" />
            <PaperTile href="/cafes"          label={t.homeEvents}          Icon={Coffee}      tint="#fde9c8" border="#eea024" />
            <PaperTile href="/mini-zoo"       label={t.homeCafes}           Icon={PawPrint}    tint="#e6dffd" border="#9d80ff" />
            <PaperTile href="/swimming-pools" label={t.homeSwimmingPools}   Icon={Waves}       tint="#d6eef2" border="#49c4d2" />
            <PaperTile href="/bookstores"     label={t.homeBookstores}      Icon={BookMarked}  tint="#f3dccb" border="#c47a14" />
            <PaperTile href="/others"         label={t.homeOthers}          Icon={Sparkles}    tint="#e8eaef" border="#94a3b8" plus />
          </div>
        </div>

        {/* ══════════════════════════════════
            02 — FEATURED PLACES (2×2 photo grid)
        ══════════════════════════════════ */}
        <div style={{ padding: "32px 18px 0" }}>
          <SectionHead
            kicker={t.homeFeaturedKicker}
            title={t.homeFeaturedTitle}
          />

          <div style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}>
            {featured.map((place) => (
              <Link key={place.id} href={`/place/${place.id}`} className="press-photo" style={{ textDecoration: "none", borderRadius: 20 }}>
                <div style={{
                  height: 175,
                  borderRadius: 20,
                  overflow: "clip",
                  position: "relative",
                  boxShadow: "0 8px 20px rgba(15,23,42,0.14)",
                }}>
                  {/* photo */}
                  <img
                    src={place.photo}
                    alt={place.name}
                    className="photo-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {/* gradient overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.68) 100%)",
                  }} />
                  {/* featured badge — top right */}
                  <div style={{
                    position: "absolute", top: 10, right: 10,
                    display: "flex", alignItems: "center", gap: 3,
                    background: "rgba(0,0,0,0.35)",
                    borderRadius: 999, padding: "4px 8px",
                    fontSize: 10.5, fontWeight: 700, color: "#f6b545",
                    letterSpacing: 0.3,
                  }}>
                    ✦ Featured
                  </div>
                  {/* text block — bottom */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "10px 12px 12px",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontSize: 15, fontWeight: 600, color: "#fff",
                      letterSpacing: -0.3, lineHeight: 1.2,
                    }}>{place.name}</div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4,
                      marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.8)",
                      fontWeight: 600,
                    }}>
                      <MapPin size={9} strokeWidth={2.5} />
                      {place.area}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════
            03 — BERITA & ARTIKEL
        ══════════════════════════════════ */}
        <div style={{ padding: "32px 18px 0" }}>
          <SectionHead
            kicker="Dari Redaksi"
            title="Berita & Artikel"
          />

          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {articles.slice(0, 3).map((article) => (
              <Link key={article.id} href={`/berita/${article.id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "#fff", borderRadius: 18,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 0 rgba(15,23,42,0.04), 0 4px 10px rgba(15,23,42,0.05)",
                  padding: "12px 14px",
                  display: "flex", gap: 12, alignItems: "center",
                }}>
                  {/* emoji */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: "#f1f5f9",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                  }}>
                    {article.emoji}
                  </div>
                  {/* text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{
                        display: "inline-block",
                        padding: "2px 7px", borderRadius: 999,
                        fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4,
                        background: "#dbeafe", color: "#1d4ed8",
                      }}>
                        {article.category}
                      </span>
                    </div>
                    <p style={{
                      margin: "0 0 4px",
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontSize: 13.5, fontWeight: 600, color: "var(--tk-ink)",
                      lineHeight: 1.3, letterSpacing: -0.2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}>
                      {article.title}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--tk-muted)", fontWeight: 600 }}>
                        {article.date}
                      </span>
                      <span style={{ width: 3, height: 3, borderRadius: 999, background: "#cbd5e1", flexShrink: 0 }} />
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--tk-muted)", fontWeight: 600 }}>
                        <Clock size={10} strokeWidth={2} />
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={14} color="#cbd5e1" strokeWidth={2} style={{ flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>

          {/* Show more button */}
          <Link href="/berita" style={{ textDecoration: "none", display: "block", marginTop: 12 }}>
            <div style={{
              borderRadius: 16, padding: "14px 0",
              background: "#fff", border: "1.5px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "var(--font-jakarta),sans-serif",
              fontSize: 13.5, fontWeight: 700, color: "var(--tk-ink)",
              boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
            }}>
              Lihat Semua Artikel
              <ArrowRight size={14} strokeWidth={2.5} />
            </div>
          </Link>
        </div>

        {/* footer wordmark */}
        <div style={{
          padding: "32px 22px 16px", textAlign: "center",
          color: "var(--tk-muted)", fontSize: 11,
          letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700,
        }}>
          ✦ TangselKids · 2026 ✦
        </div>

        {/* ══════════════════════════════════
            FOR OWNERS — subtle bottom card
        ══════════════════════════════════ */}
        <div style={{ padding: "0 18px 8px" }}>
          <Link href="/list-your-place" style={{ textDecoration: "none", display: "block" }}>
            <div style={{
              borderRadius: 18, padding: "14px 16px",
              background: "#fff",
              border: "1px solid var(--tk-line)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                background: "var(--tk-blue-50)", border: "1px solid rgba(30,63,176,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={18} color="var(--tk-blue-700)" strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
                  color: "var(--tk-muted)", textTransform: "uppercase",
                }}>{t.homeOwnerKicker}</div>
                <div style={{
                  fontSize: 13.5, fontWeight: 700,
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  color: "var(--tk-ink)", marginTop: 1,
                }}>{t.homeListBanner}</div>
              </div>
              <ArrowRight size={16} color="var(--tk-muted)" strokeWidth={2} style={{ flexShrink: 0 }} />
            </div>
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════
          CHUNKY TAB BAR
      ══════════════════════════════════ */}
      <nav style={{
        position: "fixed",
        bottom: 14,
        left: 14,
        right: 14,
        margin: "0 auto",
        width: "auto",
        maxWidth: 420,
        zIndex: 50,
        borderRadius: 28, padding: 6,
        background: "#fff",
        border: "1px solid var(--tk-line)",
        boxShadow: "0 18px 40px rgba(15,23,42,0.12), 0 1px 0 rgba(15,23,42,0.04)",
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4,
      }}>
        {([
          { href: "/",        label: t.navHome,    Icon: HomeIcon, active: true  },
          { href: "/explore", label: t.navExplore, Icon: Search,   active: false },
          { href: "/saved",   label: t.navSaved,   Icon: Bookmark, active: false },
          { href: "/profile", label: t.navProfile, Icon: User,     active: false },
        ] as const).map(({ href, label, Icon, active }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              background: active ? "#0f172a" : "transparent",
              color: active ? "#fff" : "var(--tk-muted)",
              borderRadius: 22, padding: "10px 4px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              fontSize: 10.5, fontWeight: 700, letterSpacing: -0.1,
            }}>
              <Icon size={20} strokeWidth={active ? 2 : 1.75} />
              {label}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
