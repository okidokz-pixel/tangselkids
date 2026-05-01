// Variation A — Liquid Glass
// Vibrant blue mesh background, frosted glass cards on top.
// Same content/IA as the current home; just modern surfaces.

const GLASS = {
  card: {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '0.5px solid rgba(255,255,255,0.7)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 12px 30px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.06)',
  },
  cardDark: {
    background: 'rgba(15,29,79,0.42)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '0.5px solid rgba(255,255,255,0.18)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 30px rgba(0,0,0,0.18)',
  },
};

// Tiny inline SVG icon helpers — sized to 1em.
const Icon = {
  search: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={c} strokeWidth="2"/><path d="m20 20-3.5-3.5" stroke={c} strokeWidth="2" strokeLinecap="round"/></svg>,
  sliders: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M4 6h12M4 12h7M4 18h16" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="18" cy="6" r="2" stroke={c} strokeWidth="2"/><circle cx="14" cy="12" r="2" stroke={c} strokeWidth="2"/></svg>,
  check: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4 10-10" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cap: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M2 9 12 4l10 5-10 5L2 9Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  book: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2V5Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/><path d="M4 5v15a2 2 0 0 1 2-2h13" stroke={c} strokeWidth="1.8"/></svg>,
  star: (c='currentColor', f='none') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill={f}><path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.3 6.5 20.2l1.1-6.2L3 9.6l6.3-.9L12 3Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  pin: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z" stroke={c} strokeWidth="1.8"/><circle cx="12" cy="9" r="2.5" stroke={c} strokeWidth="1.8"/></svg>,
  cog: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8"/><path d="M19.4 13.6 21 14l-1 3-1.7-.4a7 7 0 0 1-1.6 1l-.4 1.7-3 .7-.4-1.7a7 7 0 0 1-1.7-1L9.5 18 7 16l1-1.4a7 7 0 0 1-.4-1.9L6 12l1-3 1.7.4a7 7 0 0 1 1.6-1L10.7 6.7l3-.7.4 1.7a7 7 0 0 1 1.7 1L17.5 8l2 2-1 1.4a7 7 0 0 1 .4 1.9Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  arrow: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  home: (c='currentColor', f=false) => f
    ? <svg width="1em" height="1em" viewBox="0 0 24 24" fill={c}><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z"/></svg>
    : <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  heart: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  user: (c='currentColor') => <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
};

// Soft chip used inside dark glass panels
function ChipDark({ children }) {
  return <span style={{
    fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
    color: '#dbe7ff',
    padding: '5px 9px', borderRadius: 999,
    background: 'rgba(255,255,255,0.10)',
    border: '0.5px solid rgba(255,255,255,0.18)',
  }}>{children}</span>;
}

function VariationAGlass() {
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--tk-font)',
      color: 'var(--tk-ink)',
      background: '#eef3ff',
    }}>
      {/* ── Vivid mesh background (the source of all the glass color) ── */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: [
          // huge blue dome behind the header
          'radial-gradient(120% 60% at 50% -10%, #2540b8 0%, #355bd9 38%, rgba(53,91,217,0) 70%)',
          // peach blush bottom-right
          'radial-gradient(60% 40% at 95% 78%, rgba(246,181,69,0.55) 0%, rgba(246,181,69,0) 70%)',
          // teal/cyan blob mid-left
          'radial-gradient(50% 35% at 0% 55%, rgba(73,196,210,0.45) 0%, rgba(73,196,210,0) 70%)',
          // rose blob mid
          'radial-gradient(45% 30% at 60% 48%, rgba(226,106,140,0.35) 0%, rgba(226,106,140,0) 70%)',
          'linear-gradient(180deg, #eaf0ff 0%, #f6f7fb 100%)',
        ].join(','),
      }} />

      {/* ── Scrollable content ── */}
      <div style={{
        position: 'relative', zIndex: 1, height: '100%', overflow: 'auto',
        paddingBottom: 110,
      }}>
        {/* Status bar spacer (handled by IOSDevice, but content starts under the island) */}
        <div style={{ height: 54 }} />

        {/* ── Top bar: locale pill + profile, on the blue dome ── */}
        <div style={{
          padding: '10px 18px 8px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: '#fff',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', borderRadius: 999,
            ...GLASS.cardDark,
            fontSize: 12, fontWeight: 600, letterSpacing: 0.4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: '#7af0b6', boxShadow: '0 0 8px #7af0b6' }} />
            BINTARO · TANGSEL
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              ...GLASS.cardDark, padding: '6px 12px', borderRadius: 999,
              fontSize: 12, fontWeight: 700, color: '#fff', display: 'flex', gap: 6, alignItems: 'center',
            }}>
              <span>ID</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{ opacity: 0.55 }}>EN</span>
            </div>
            <div style={{
              ...GLASS.cardDark, width: 36, height: 36, borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18,
            }}>{Icon.user('#fff')}</div>
          </div>
        </div>

        {/* ── Headline ── */}
        <div style={{ padding: '14px 22px 0', color: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.75, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Selamat datang ✦
          </div>
          <h1 style={{
            margin: '6px 0 6px', fontSize: 34, fontWeight: 700, letterSpacing: -0.8,
            lineHeight: 1.05, fontFamily: 'var(--tk-font-display)',
          }}>
            Tempat terbaik<br/>
            untuk <em style={{ fontStyle: 'italic', fontWeight: 500, color: '#ffd9a3' }}>si kecil</em>.
          </h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.78, lineHeight: 1.4 }}>
            Sekolah, daycare, & tempat main — semua dalam satu peta Bintaro & Tangsel.
          </p>
        </div>

        {/* ── Glass search bar ── */}
        <div style={{ padding: '20px 18px 12px' }}>
          <div style={{
            ...GLASS.card,
            borderRadius: 22, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ fontSize: 20, color: 'var(--tk-blue-700)' }}>{Icon.search()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: 'var(--tk-ink)', fontWeight: 500 }}>Cari sekolah, daycare…</div>
              <div style={{ fontSize: 11, color: 'var(--tk-muted)', marginTop: 1 }}>nama · area · tipe</div>
            </div>
            <button style={{
              border: 'none', cursor: 'pointer',
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(180deg,#3a64ee,#1e3fb0)',
              color: '#fff', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 14px rgba(30,63,176,0.45), 0 1px 0 rgba(255,255,255,0.4) inset',
            }}>{Icon.sliders('#fff')}</button>
          </div>

          {/* status pill row */}
          <div style={{
            display: 'flex', gap: 6, marginTop: 10, color: '#fff',
            fontSize: 11.5, fontWeight: 600,
          }}>
            {[
              ['9', 'Sekolah'],
              ['6', 'Learning Centers'],
              ['4', 'Playground'],
            ].map(([n, l]) => (
              <div key={l} style={{
                ...GLASS.cardDark, flex: 1,
                padding: '8px 10px', borderRadius: 14,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: '#7af0b6', fontSize: 13, lineHeight: 1 }}>{Icon.check('#7af0b6')}</span>
                <span style={{ opacity: 0.6 }}>{n}</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── "Kamu cari apa?" section ── */}
        <div style={{ padding: '18px 18px 0', position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            color: '#fff', marginBottom: 12,
          }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: -0.3, fontFamily: 'var(--tk-font-display)' }}>
              Kamu cari apa?
            </h2>
            <span style={{ fontSize: 12, opacity: 0.7 }}>9 kategori</span>
          </div>

          {/* Two big featured glass cards stacked */}
          <CategoryHero
            icon={Icon.cap('#fff')}
            title="Sekolah"
            sub="Berdasarkan harga, kurikulum & area"
            chips={['TK', 'SD', 'SMP', 'SMA']}
            tone="violet"
          />
          <div style={{ height: 10 }} />
          <CategoryHero
            icon={Icon.book('#fff')}
            title="Learning Centers"
            sub="Berdasarkan tipe kursus & area"
            chips={['English', 'Math', 'Art', 'Music', 'Coding']}
            tone="teal"
          />

          {/* Image-tile grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10, marginTop: 12,
          }}>
            <ImageTile label="Daycare" img="linear-gradient(135deg,#7d9bff,#3a64ee 60%,#1a3592)" emoji="🧸" />
            <ImageTile label="Taman Bermain" img="linear-gradient(135deg,#5fbf9d,#2a7d62)" emoji="🌳" />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10, marginTop: 10,
          }}>
            <ImageTile small label="Klinik" img="linear-gradient(135deg,#e26a8a,#9d2a4f)" emoji="🩺" />
            <ImageTile small label="Kafe Anak" img="linear-gradient(135deg,#f6b545,#c47a14)" emoji="🍩" />
            <ImageTile small label="Mini Zoo" img="linear-gradient(135deg,#9d80ff,#5b3ed1)" emoji="🦒" />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10, marginTop: 10,
          }}>
            <ImageTile small label="Kolam Renang" img="linear-gradient(135deg,#49c4d2,#1f7a85)" emoji="🏊" />
            <ImageTile small label="Toko Buku" img="linear-gradient(135deg,#ec8a5e,#a8552b)" emoji="📚" />
            <ImageTile small label="Lainnya" img="linear-gradient(135deg,#94a3b8,#475569)" emoji="✦" plus />
          </div>
        </div>

        {/* ── CTA: Daftarkan tempat ── */}
        <div style={{ padding: '18px 18px 0' }}>
          <div style={{
            ...GLASS.cardDark, borderRadius: 24,
            padding: 18, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <div aria-hidden style={{
              position: 'absolute', inset: -40, zIndex: -1,
              background: 'radial-gradient(40% 60% at 90% 40%, rgba(246,181,69,.45), transparent 70%)',
            }} />
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'rgba(255,255,255,0.12)',
              border: '0.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>{Icon.cog('#fff')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>
                Punya tempat anak?
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2, lineHeight: 1.35 }}>
                Daftarkan kelas, sekolah, atau tempat bermain ke TangselKids.
              </div>
              <button style={{
                marginTop: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(180deg,#f6b545,#eea024)',
                color: '#3a2304', fontWeight: 700, fontSize: 12.5,
                padding: '8px 14px', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                boxShadow: '0 6px 14px rgba(238,160,36,0.4), 0 1px 0 rgba(255,255,255,0.5) inset',
              }}>Daftarkan sekarang <span style={{ fontSize: 14 }}>{Icon.arrow('#3a2304')}</span></button>
            </div>
          </div>
        </div>

        {/* ── "Tempat Unggulan" — featured listings on light glass ── */}
        <div style={{ padding: '24px 0 0' }}>
          <div style={{
            padding: '0 22px 12px',
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: '#dbe7ff', textTransform: 'uppercase', fontWeight: 700 }}>
                Editor's pick
              </div>
              <h2 style={{
                margin: '2px 0 0', color: '#fff', fontFamily: 'var(--tk-font-display)',
                fontSize: 24, fontWeight: 700, letterSpacing: -0.4,
              }}>Tempat Unggulan</h2>
            </div>
            <a style={{ fontSize: 12, color: '#ffd9a3', fontWeight: 600 }}>Lihat semua →</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 18px' }}>
            <ListingGlass
              area="Bintaro Sektor 7"
              tag="Top-rated"
              tagColor="#f6b545"
              title="Little Stars Montessori"
              rating="4.9"
              reviews="47"
              price="Rp 2.5jt"
              gradient="linear-gradient(135deg,#5b86fb,#1e3fb0 70%)"
              emoji="🎒"
            />
            <ListingGlass
              area="Bintaro Sektor 5"
              tag="Most Loved"
              tagColor="#e26a8a"
              title="Happy Tots Daycare"
              rating="4.7"
              reviews="28"
              price="Rp 1.5jt"
              gradient="linear-gradient(135deg,#7af0b6,#1f9b6a 70%)"
              emoji="🧸"
            />
            <ListingGlass
              area="Pondok Jaya"
              tag="Popular"
              tagColor="#9d80ff"
              title="Spark English Center"
              rating="4.8"
              reviews="35"
              price="Rp 400k"
              priceUnit="bln"
              gradient="linear-gradient(135deg,#ffb37a,#e26a4f 70%)"
              emoji="✏️"
            />
          </div>
        </div>

        {/* ── Aktifkan Lokasi ── */}
        <div style={{ padding: '24px 18px 0' }}>
          <div style={{
            ...GLASS.card,
            borderRadius: 24, padding: 18,
            display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden',
          }}>
            <div aria-hidden style={{
              position: 'absolute', right: -30, top: -30, width: 150, height: 150,
              borderRadius: 999, background: 'radial-gradient(circle, rgba(58,100,238,0.18), transparent 70%)',
            }} />
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(180deg,#dbe7ff,#b9ceff)',
              border: '0.5px solid rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--tk-blue-700)', fontSize: 22,
              boxShadow: '0 4px 12px rgba(30,63,176,0.18), 0 1px 0 rgba(255,255,255,0.9) inset',
            }}>{Icon.pin('var(--tk-blue-700)')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Di sekitarmu</div>
              <div style={{ fontSize: 12, color: 'var(--tk-muted)', marginTop: 1, lineHeight: 1.4 }}>
                Aktifkan lokasi untuk pilihan terdekat.
              </div>
            </div>
            <button style={{
              border: 'none', cursor: 'pointer',
              padding: '10px 14px', borderRadius: 999,
              background: 'linear-gradient(180deg,#3a64ee,#1e3fb0)',
              color: '#fff', fontSize: 12.5, fontWeight: 700,
              boxShadow: '0 6px 14px rgba(30,63,176,0.45), 0 1px 0 rgba(255,255,255,0.4) inset',
            }}>Aktifkan</button>
          </div>
        </div>
      </div>

      {/* ── Floating glass tab bar ── */}
      <FloatingTabBar />
    </div>
  );
}

function CategoryHero({ icon, title, sub, chips, tone }) {
  const tones = {
    violet: 'linear-gradient(135deg, rgba(91,134,251,0.85), rgba(45,62,176,0.85))',
    teal:   'linear-gradient(135deg, rgba(73,196,210,0.85), rgba(30,90,140,0.85))',
  };
  return (
    <div style={{
      borderRadius: 22, padding: 16,
      background: tones[tone],
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      border: '0.5px solid rgba(255,255,255,0.25)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 30px rgba(15,23,42,0.18)',
      color: '#fff', display: 'flex', alignItems: 'flex-start', gap: 14,
      position: 'relative', overflow: 'hidden',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(60% 80% at 100% 0%, rgba(255,255,255,0.18), transparent 60%)',
      }} />
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'rgba(255,255,255,0.16)',
        border: '0.5px solid rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>{title}</div>
        <div style={{ fontSize: 12, opacity: 0.78, marginTop: 1 }}>{sub}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {chips.map(c => <ChipDark key={c}>{c}</ChipDark>)}
        </div>
      </div>
      <span style={{
        position: 'absolute', top: 14, right: 14,
        fontSize: 16, opacity: 0.7,
      }}>{Icon.star('#fff')}</span>
    </div>
  );
}

function ImageTile({ label, img, emoji, small, plus }) {
  return (
    <div style={{
      position: 'relative',
      aspectRatio: small ? '1.05/1' : '1.5/1',
      borderRadius: 18, overflow: 'hidden',
      background: img,
      boxShadow: '0 8px 22px rgba(15,23,42,0.16), 0 1px 0 rgba(255,255,255,0.3) inset',
      border: '0.5px solid rgba(255,255,255,0.18)',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: 8, right: 10, fontSize: small ? 22 : 28, opacity: 0.9,
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
      }}>{emoji}</div>
      <div style={{
        position: 'absolute', left: 10, bottom: 8, color: '#fff',
        fontSize: small ? 12 : 13.5, fontWeight: 700, letterSpacing: -0.1,
        textShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}>{label}{plus && <span style={{ marginLeft: 4, opacity: 0.7 }}>↗</span>}</div>
    </div>
  );
}

function ListingGlass({ area, tag, tagColor, title, rating, reviews, price, priceUnit='bln', gradient, emoji }) {
  return (
    <div style={{
      ...GLASS.card,
      borderRadius: 22, padding: 10,
      display: 'flex', gap: 12, alignItems: 'stretch',
    }}>
      <div style={{
        width: 92, borderRadius: 14, background: gradient,
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(15,23,42,0.18) inset',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(60% 80% at 30% 20%, rgba(255,255,255,0.35), transparent 60%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))',
        }}>{emoji}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '4px 4px 4px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{
            fontSize: 10.5, color: 'var(--tk-blue-700)', fontWeight: 700, letterSpacing: 0.3,
            textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 10 }}>{Icon.pin('var(--tk-blue-700)')}</span>
            {area}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: '#fff', padding: '3px 8px', borderRadius: 999,
            background: tagColor,
            boxShadow: `0 4px 10px ${tagColor}55`,
          }}>{tag}</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 3, letterSpacing: -0.2, lineHeight: 1.15 }}>{title}</div>
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 6, gap: 6,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, color: 'var(--tk-ink)', fontWeight: 600,
          }}>
            <span style={{ color: '#f6b545', fontSize: 12 }}>{Icon.star('#f6b545', '#f6b545')}</span>
            {rating}
            <span style={{ color: 'var(--tk-muted)', fontWeight: 500 }}>· {reviews} ulasan</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tk-blue-700)' }}>
            {price}<span style={{ fontSize: 10, color: 'var(--tk-muted)', fontWeight: 500 }}> /{priceUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingTabBar() {
  const items = [
    { k: 'home', label: 'Beranda', icon: Icon.home, active: true },
    { k: 'search', label: 'Jelajah', icon: Icon.search, active: false },
    { k: 'heart', label: 'Tersimpan', icon: Icon.heart, active: false },
    { k: 'me', label: 'Profil', icon: Icon.user, active: false },
  ];
  return (
    <div style={{
      position: 'absolute', left: 16, right: 16, bottom: 18, zIndex: 30,
      borderRadius: 28, padding: 6,
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      border: '0.5px solid rgba(255,255,255,0.7)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 18px 40px rgba(15,23,42,0.18)',
      display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4,
    }}>
      {items.map(it => (
        <button key={it.k} style={{
          border: 'none', background: it.active ? 'linear-gradient(180deg,#3a64ee,#1e3fb0)' : 'transparent',
          color: it.active ? '#fff' : 'var(--tk-ink-2)',
          borderRadius: 22, padding: '8px 4px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          fontSize: 10.5, fontWeight: 700, letterSpacing: -0.1,
          cursor: 'pointer',
          boxShadow: it.active ? '0 6px 14px rgba(30,63,176,0.45), 0 1px 0 rgba(255,255,255,0.4) inset' : 'none',
        }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{it.icon(it.active ? '#fff' : 'var(--tk-ink-2)', it.active)}</span>
          {it.label}
        </button>
      ))}
    </div>
  );
}

window.VariationAGlass = VariationAGlass;
