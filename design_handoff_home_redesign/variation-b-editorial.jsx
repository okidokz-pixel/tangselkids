// Variation B — Editorial / Chunky Rounded
// Off-white paper canvas, big rounded color blocks, magazine hierarchy.
// Same content as Variation A; very different mood — flatter, friendlier,
// matte (no glass).

const IconB = window.IconB = {
  search: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={c} strokeWidth="2"/><path d="m20 20-3.5-3.5" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  arrow: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  star: (c='currentColor', f='none') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill={f}><path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.3 6.5 20.2l1.1-6.2L3 9.6l6.3-.9L12 3Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  pin: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="9" r="2.5" stroke={c} strokeWidth="1.8"/></svg>,
  cap: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M2 9 12 4l10 5-10 5L2 9Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  book: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2V5Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  home: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  heart: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  user: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  bookmark: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4V4Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  spark: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 3v6m0 6v6M3 12h6m6 0h6M6 6l3 3m6 6 3 3M18 6l-3 3m-6 6-3 3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
};

function VariationBEditorial() {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--tk-font)',
      color: 'var(--tk-ink)',
      background: '#f3efe8',
    }}>
      {/* paper grain */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(1px 1px at 20% 30%, rgba(15,23,42,0.04) 50%, transparent 51%)',
          'radial-gradient(1px 1px at 75% 80%, rgba(15,23,42,0.03) 50%, transparent 51%)',
          'linear-gradient(180deg, #f6f1e8 0%, #f3efe8 60%, #efeae0 100%)',
        ].join(','),
        backgroundSize: '14px 14px, 22px 22px, 100% 100%',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, height: '100%', overflow: 'auto',
        paddingBottom: 110,
      }}>
        <div style={{ height: 54 }} />

        {/* ── Hero header (single big rounded blue panel) ── */}
        <div style={{ padding: '8px 14px 0' }}>
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: 32,
            background: 'linear-gradient(170deg, #1e3fb0 0%, #2a4fd8 60%, #3a64ee 100%)',
            color: '#fff', padding: '18px 20px 22px',
            boxShadow: '0 18px 40px rgba(30,63,176,0.28), 0 1px 0 rgba(255,255,255,0.18) inset',
          }}>
            {/* decorative orbits */}
            <svg aria-hidden width="320" height="320" viewBox="0 0 320 320" style={{
              position: 'absolute', right: -90, top: -90, opacity: 0.18,
            }}>
              <circle cx="160" cy="160" r="70"  stroke="#fff" strokeWidth="1" fill="none"/>
              <circle cx="160" cy="160" r="105" stroke="#fff" strokeWidth="1" fill="none"/>
              <circle cx="160" cy="160" r="140" stroke="#fff" strokeWidth="1" fill="none"/>
              <circle cx="240" cy="100" r="6"  fill="#f6b545"/>
              <circle cx="80" cy="220" r="4"  fill="#7af0b6"/>
            </svg>

            {/* top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 11px', borderRadius: 999,
                background: 'rgba(0,0,0,0.18)',
                border: '0.5px solid rgba(255,255,255,0.18)',
                fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: '#7af0b6' }}/>
                BINTARO · TANGSEL
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                  padding: '6px 10px', borderRadius: 999,
                  background: 'rgba(0,0,0,0.2)',
                }}>
                  ID <span style={{ opacity: 0.45 }}>· EN</span>
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: 'linear-gradient(135deg,#f6b545,#e26a4f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#3a2304',
                  border: '2px solid rgba(255,255,255,0.4)',
                }}>R</div>
              </div>
            </div>

            {/* wordmark */}
            <div style={{ marginTop: 22 }}>
              <div style={{
                fontSize: 13, opacity: 0.78, fontWeight: 600, letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}>
                The directory for kids in
              </div>
              <h1 style={{
                margin: '4px 0 0',
                fontFamily: 'var(--tk-font-display)',
                fontSize: 52, lineHeight: 0.95, fontWeight: 600, letterSpacing: -2,
              }}>
                Tangsel<span style={{ color: '#f6b545' }}>.</span>
              </h1>
              <div style={{
                fontFamily: 'var(--tk-font-display)',
                fontStyle: 'italic', fontSize: 22, lineHeight: 1, opacity: 0.85,
                marginTop: 2, fontWeight: 400,
              }}>
                Kids
              </div>
            </div>

            <p style={{
              margin: '14px 0 0', fontSize: 13.5, opacity: 0.82, lineHeight: 1.45,
              maxWidth: 280,
            }}>
              Sekolah, daycare & tempat main terbaik di Bintaro & sekitarnya — kurasi orang tua.
            </p>

            {/* search inside the hero */}
            <div style={{
              marginTop: 18, background: '#fff',
              borderRadius: 18, padding: '6px 6px 6px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
            }}>
              <span style={{ fontSize: 18, color: 'var(--tk-blue-700)' }}>{IconB.search()}</span>
              <span style={{ flex: 1, fontSize: 14, color: 'var(--tk-muted)' }}>Cari sekolah, area…</span>
              <button style={{
                border: 'none', cursor: 'pointer',
                padding: '9px 14px', borderRadius: 12,
                background: 'var(--tk-ink)', color: '#fff',
                fontWeight: 700, fontSize: 12.5, letterSpacing: 0.2,
              }}>Cari</button>
            </div>

            {/* counters */}
            <div style={{
              display: 'flex', gap: 18, marginTop: 16,
              fontSize: 12,
            }}>
              {[['9','Sekolah'], ['6','Centers'], ['4','Playground']].map(([n,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{
                    fontFamily: 'var(--tk-font-display)', fontSize: 20, fontWeight: 600, color: '#f6b545',
                  }}>{n}</span>
                  <span style={{ opacity: 0.78 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── "Kategori" — magazine grid ── */}
        <div style={{ padding: '24px 18px 0' }}>
          <SectionHead kicker="01 — Kategori" title="Kamu cari apa?" link="9 kategori" />

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <CategoryRowB
              icon={IconB.cap('#fff')}
              title="Sekolah"
              count="9 tempat"
              sub="TK · SD · SMP · SMA — filter kurikulum & area"
              bg="linear-gradient(135deg,#1e3fb0,#3a64ee)"
              accent="#f6b545"
            />
            <CategoryRowB
              icon={IconB.book('#fff')}
              title="Learning Centers"
              count="6 tempat"
              sub="English · Math · Art · Music · Coding"
              bg="linear-gradient(135deg,#2a7d62,#1f9b6a)"
              accent="#7af0b6"
            />
          </div>

          {/* tile grid — paper cards with color block */}
          <div style={{
            marginTop: 12,
            display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 10,
          }}>
            <PaperTile big label="Daycare" sub="3 pilihan" emoji="🧸" tint="#fde2c8" border="#f6b545" />
            <PaperTile     label="Taman Bermain" sub="4 pilihan" emoji="🌳" tint="#d4ead7" border="#1f9b6a" />
          </div>
          <div style={{
            marginTop: 10,
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10,
          }}>
            <PaperTile label="Klinik" emoji="🩺" tint="#fbe1ea" border="#e26a8a" />
            <PaperTile label="Kafe Anak" emoji="🍩" tint="#fde9c8" border="#eea024" />
            <PaperTile label="Mini Zoo" emoji="🦒" tint="#e6dffd" border="#9d80ff" />
          </div>
          <div style={{
            marginTop: 10,
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10,
          }}>
            <PaperTile label="Kolam" emoji="🏊" tint="#d6eef2" border="#49c4d2" />
            <PaperTile label="Toko Buku" emoji="📚" tint="#f3dccb" border="#c47a14" />
            <PaperTile label="Lainnya" sub="+ 12" emoji="✦" tint="#e8eaef" border="#94a3b8" plus />
          </div>
        </div>

        {/* ── Daftarkan tempat — split sticker card ── */}
        <div style={{ padding: '24px 18px 0' }}>
          <div style={{
            position: 'relative',
            borderRadius: 28, padding: 20,
            background: '#0e1d4f',
            color: '#fff', overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(14,29,79,0.25)',
          }}>
            <div aria-hidden style={{
              position: 'absolute', right: -40, bottom: -40, width: 220, height: 220, borderRadius: 999,
              background: 'radial-gradient(circle, rgba(246,181,69,0.35), transparent 70%)',
            }} />
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: '#f6b545', textTransform: 'uppercase',
            }}>For owners</div>
            <div style={{
              marginTop: 4, fontFamily: 'var(--tk-font-display)',
              fontSize: 26, lineHeight: 1.1, fontWeight: 600, letterSpacing: -0.4,
              maxWidth: 240,
            }}>
              Punya tempat anak? <em style={{ color: '#f6b545', fontStyle: 'italic', fontWeight: 500 }}>Daftarkan.</em>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 12.5, opacity: 0.7, lineHeight: 1.45, maxWidth: 260 }}>
              Sekolah, daycare, atau tempat bermain — bantu orang tua di Tangsel menemukan tempatmu.
            </p>
            <button style={{
              marginTop: 14, border: 'none', cursor: 'pointer',
              background: '#f6b545', color: '#3a2304',
              fontWeight: 700, fontSize: 13,
              padding: '11px 16px', borderRadius: 14,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>Daftarkan sekarang <span style={{ fontSize: 14 }}>{IconB.arrow('#3a2304')}</span></button>
          </div>
        </div>

        {/* ── Tempat Unggulan — full-bleed editorial cards ── */}
        <div style={{ padding: '32px 0 0' }}>
          <div style={{ padding: '0 22px' }}>
            <SectionHead kicker="02 — Editor's pick" title="Tempat Unggulan" link="Lihat semua →" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 18px 0' }}>
            <ListingEditorial
              num="01"
              area="Bintaro Sektor 7"
              tag="TOP RATED"
              tagColor="#1e3fb0"
              title="Little Stars Montessori"
              kicker="Sekolah · Pre-school"
              rating="4.9" reviews="47" price="2.5jt"
              bg="linear-gradient(135deg,#5b86fb,#1e3fb0)"
              emoji="🎒"
            />
            <ListingEditorial
              num="02"
              area="Bintaro Sektor 5"
              tag="MOST LOVED"
              tagColor="#1f9b6a"
              title="Happy Tots Daycare"
              kicker="Daycare · 1–5 thn"
              rating="4.7" reviews="28" price="1.5jt"
              bg="linear-gradient(135deg,#7af0b6,#1f9b6a)"
              emoji="🧸"
            />
            <ListingEditorial
              num="03"
              area="Pondok Jaya"
              tag="POPULAR"
              tagColor="#c47a14"
              title="Spark English Center"
              kicker="Learning · English"
              rating="4.8" reviews="35" price="400k" priceUnit="bln"
              bg="linear-gradient(135deg,#ffb37a,#e26a4f)"
              emoji="✏️"
            />
          </div>
        </div>

        {/* ── Lokasi ── */}
        <div style={{ padding: '24px 18px 0' }}>
          <div style={{
            borderRadius: 24, padding: 16,
            background: '#fff', border: '1px solid var(--tk-line)',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 1px 0 rgba(15,23,42,0.04), 0 12px 24px rgba(15,23,42,0.05)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(135deg,#dbe7ff,#b9ceff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--tk-blue-700)', fontSize: 24,
              border: '1px solid rgba(30,63,176,0.12)',
            }}>{IconB.pin('var(--tk-blue-700)')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--tk-muted)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700 }}>Aktifkan lokasi</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, fontFamily: 'var(--tk-font-display)' }}>Cari di sekitarmu</div>
            </div>
            <button style={{
              border: 'none', cursor: 'pointer',
              padding: '11px 14px', borderRadius: 14,
              background: 'var(--tk-ink)', color: '#fff',
              fontSize: 12.5, fontWeight: 700, letterSpacing: 0.2,
            }}>Aktifkan</button>
          </div>
        </div>

        {/* footer wordmark */}
        <div style={{
          padding: '32px 22px 12px', textAlign: 'center',
          color: 'var(--tk-muted)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700,
        }}>
          ✦ TangselKids · 2026 ✦
        </div>
      </div>

      {/* tab bar — chunky pill */}
      <ChunkyTabBar />
    </div>
  );
}

function SectionHead({ kicker, title, link }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--tk-blue-700)',
        textTransform: 'uppercase',
      }}>{kicker}</div>
      <div style={{
        marginTop: 4, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      }}>
        <h2 style={{
          margin: 0, fontFamily: 'var(--tk-font-display)', fontSize: 28,
          fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.05,
        }}>{title}</h2>
        {link && <span style={{ fontSize: 12, color: 'var(--tk-muted)', fontWeight: 600 }}>{link}</span>}
      </div>
    </div>
  );
}

function CategoryRowB({ icon, title, count, sub, bg, accent }) {
  return (
    <div style={{
      borderRadius: 22, padding: 16,
      background: bg, color: '#fff',
      display: 'flex', alignItems: 'center', gap: 14,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 12px 28px rgba(15,23,42,0.12), 0 1px 0 rgba(255,255,255,0.18) inset',
    }}>
      {/* hatched accent strip */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, bottom: 0, right: 0, width: 4,
        background: accent,
      }} />
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontFamily: 'var(--tk-font-display)', fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>{title}</div>
          <div style={{ fontSize: 11, color: accent, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{count}</div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.78, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: 999,
        background: '#fff', color: bg.includes('1e3fb0') ? '#1e3fb0' : '#1f9b6a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, flexShrink: 0,
      }}>{IconB.arrow()}</div>
    </div>
  );
}

function PaperTile({ label, sub, emoji, tint, border, big, plus }) {
  return (
    <div style={{
      position: 'relative',
      aspectRatio: big ? '1.4/1' : '1/1',
      borderRadius: 20,
      background: tint,
      border: `1px solid ${border}33`,
      padding: big ? 14 : 12,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      overflow: 'hidden',
      boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 6px 14px rgba(15,23,42,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: big ? 36 : 30, height: big ? 36 : 30, borderRadius: big ? 12 : 10,
          background: '#fff', border: `1px solid ${border}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: big ? 20 : 16,
        }}>{emoji}</div>
        {plus && (
          <div style={{
            width: 26, height: 26, borderRadius: 999, background: '#fff',
            border: `1px solid ${border}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: border, fontSize: 14, fontWeight: 700,
          }}>+</div>
        )}
      </div>
      <div>
        <div style={{
          fontSize: big ? 16 : 13, fontWeight: 700, letterSpacing: -0.2, color: 'var(--tk-ink)',
          fontFamily: 'var(--tk-font-display)',
        }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 11, color: 'var(--tk-muted)', fontWeight: 600, marginTop: 1 }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function ListingEditorial({ num, area, tag, tagColor, title, kicker, rating, reviews, price, priceUnit='bln', bg, emoji }) {
  return (
    <div style={{
      borderRadius: 26, background: '#fff',
      border: '1px solid var(--tk-line)',
      overflow: 'hidden',
      boxShadow: '0 1px 0 rgba(15,23,42,0.03), 0 18px 30px rgba(15,23,42,0.06)',
    }}>
      <div style={{
        height: 130, position: 'relative', background: bg, overflow: 'hidden',
      }}>
        {/* big number watermark */}
        <div aria-hidden style={{
          position: 'absolute', left: -10, top: -30,
          fontFamily: 'var(--tk-font-display)', fontSize: 180, fontWeight: 600,
          color: 'rgba(255,255,255,0.18)', lineHeight: 1, letterSpacing: -8,
        }}>{num}</div>
        <div aria-hidden style={{
          position: 'absolute', right: 16, bottom: 8, fontSize: 64,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
        }}>{emoji}</div>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
          padding: '5px 9px', borderRadius: 999,
          background: '#fff', color: tagColor,
        }}>{tag}</div>
        <div style={{
          position: 'absolute', left: 14, top: 14,
          fontSize: 10.5, fontWeight: 700, color: '#fff', opacity: 0.92,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '5px 9px', borderRadius: 999,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(6px)',
        }}>
          <span style={{ fontSize: 10 }}>{IconB.pin('#fff')}</span>
          {area}
        </div>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 11, color: 'var(--tk-muted)', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {kicker}
        </div>
        <div style={{
          marginTop: 3, fontFamily: 'var(--tk-font-display)',
          fontSize: 22, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.1,
        }}>{title}</div>
        <div style={{
          marginTop: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            <span style={{ color: '#f6b545', fontSize: 14 }}>{IconB.star('#f6b545', '#f6b545')}</span>
            {rating}
            <span style={{ color: 'var(--tk-muted)', fontWeight: 500 }}>· {reviews} ulasan</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 2,
            padding: '6px 12px', borderRadius: 999,
            background: 'var(--tk-blue-50)', color: 'var(--tk-blue-700)',
            fontSize: 13, fontWeight: 800,
          }}>
            Rp {price}
            <span style={{ fontSize: 10, color: 'var(--tk-muted)', fontWeight: 500 }}>/{priceUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChunkyTabBar() {
  const items = [
    { k: 'home', label: 'Beranda', icon: IconB.home, active: true },
    { k: 'search', label: 'Jelajah', icon: IconB.search },
    { k: 'heart', label: 'Tersimpan', icon: IconB.bookmark },
    { k: 'me', label: 'Profil', icon: IconB.user },
  ];
  return (
    <div style={{
      position: 'absolute', left: 14, right: 14, bottom: 14, zIndex: 30,
      borderRadius: 28, padding: 6,
      background: '#fff',
      border: '1px solid var(--tk-line)',
      boxShadow: '0 18px 40px rgba(15,23,42,0.12), 0 1px 0 rgba(15,23,42,0.04)',
      display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4,
    }}>
      {items.map(it => (
        <button key={it.k} style={{
          border: 'none',
          background: it.active ? 'var(--tk-ink)' : 'transparent',
          color: it.active ? '#fff' : 'var(--tk-muted)',
          borderRadius: 22, padding: '10px 4px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          fontSize: 10.5, fontWeight: 700, letterSpacing: -0.1,
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{it.icon(it.active ? '#fff' : 'var(--tk-muted)')}</span>
          {it.label}
        </button>
      ))}
    </div>
  );
}

window.VariationBEditorial = VariationBEditorial;
