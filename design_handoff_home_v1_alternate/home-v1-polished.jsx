// V1 Polished — cut-paper editorial home with real photos & interactions.
// Builds on HomeA2v1Collage; adds:
//  • real Unsplash photos for cover story, polaroid kids, articles
//  • working tabs, search w/ live suggestions, save toggle, animated counter
//  • pressable feature cards w/ expanding peek-sheet
//  • scroll-aware sticky masthead
//  • subtle entrance animations

const { useState, useEffect, useRef, useMemo } = React;

// ─── photo library ──────────────────────────────────────────────────────────
// Unsplash source URLs (free, no auth). Curated kids/schools/play imagery.
const PHOTOS = {
  // cover story — montessori-ish school exterior with kids
  cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80&auto=format&fit=crop',
  // masthead kid cutouts (will be cut out into "polaroid" cards behind tape)
  kid1: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&q=80&auto=format&fit=crop',
  kid2: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80&auto=format&fit=crop',
  // feature cards
  sekolah: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&q=80&auto=format&fit=crop',
  kursus: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=700&q=80&auto=format&fit=crop',
  // articles
  art1: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80&auto=format&fit=crop',
  art2: 'https://images.unsplash.com/photo-1588072432904-843af37f03ed?w=400&q=80&auto=format&fit=crop',
  art3: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&q=80&auto=format&fit=crop',
};

// ─── tiny atoms ─────────────────────────────────────────────────────────────
function Chev({ size = 14, color = '#0e1d4f', dir = 'right', stroke = 2.4 }) {
  const rot = { left: 180, right: 0, up: 270, down: 90 }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         style={{ transform: `rotate(${rot}deg)`, flexShrink: 0 }}>
      <path d="M9 6l6 6-6 6" stroke={color} strokeWidth={stroke}
            strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Heart({ filled, color = '#e26a6a' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? color : 'none'}
         style={{ transition: 'transform .18s ease' }}>
      <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"
            stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

// Press wrapper — gives any tappable a subtle scale + shadow lift on press
function Pressable({ children, onClick, style, scale = 0.97 }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onClick}
      style={{
        transform: pressed ? `scale(${scale})` : 'scale(1)',
        transition: 'transform .14s cubic-bezier(.2,.7,.3,1)',
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// animate a number up to value
function useAnimatedNumber(target, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start; let raf;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / duration);
      setV(Math.round(ease(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

// ─── shell ──────────────────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: '#f6f1e8',
      fontFamily: 'var(--tk-font)', color: '#0e1d4f',
      overflow: 'hidden', position: 'relative',
    }}>{children}</div>
  );
}

// ─── tab bar ────────────────────────────────────────────────────────────────
function TabBar({ active, onSwitch }) {
  const items = [
    ['home', 'Beranda', '⌂'],
    ['search', 'Jelajah', '⌕'],
    ['save', 'Tersimpan', '♥'],
    ['user', 'Profil', '◯'],
  ];
  return (
    <div style={{
      position: 'absolute', left: 14, right: 14, bottom: 14,
      background: '#fff', borderRadius: 28, padding: 6,
      border: '1px solid rgba(15,23,42,0.08)',
      boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      zIndex: 10,
    }}>
      {items.map(([k, label, ic]) => {
        const on = k === active;
        return (
          <Pressable key={k} onClick={() => onSwitch(k)} scale={0.94}
            style={{
              flex: 1, padding: '8px 6px', textAlign: 'center', borderRadius: 22,
              background: on ? '#0e1d4f' : 'transparent',
              color: on ? '#fff' : '#64748b',
              fontSize: 11, fontWeight: 700,
              transition: 'background .25s ease, color .25s ease',
            }}>
            <div style={{ fontSize: 14, lineHeight: 1, marginBottom: 3 }}>{ic}</div>
            {label}
          </Pressable>
        );
      })}
    </div>
  );
}

// ─── search w/ live suggestions ─────────────────────────────────────────────
const SUGGESTIONS = [
  { tag: 'SEKOLAH', name: 'Little Stars Montessori', area: 'Bintaro 7' },
  { tag: 'SEKOLAH', name: 'Sekolah Alam Bintaro', area: 'Bintaro 9' },
  { tag: 'KURSUS', name: 'Wall Street English Kids', area: 'Bintaro X' },
  { tag: 'DAYCARE', name: 'Tumble Tots Daycare', area: 'Pondok Aren' },
  { tag: 'PLAYGROUND', name: 'KidZania Tangsel', area: 'BSD Junction' },
  { tag: 'KAFE', name: 'Cafe Tanaman', area: 'Bintaro 7' },
];

function SearchBar({ area, onAreaClick }) {
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);
  const matches = useMemo(() => {
    if (!q) return [];
    const s = q.toLowerCase();
    return SUGGESTIONS.filter(x =>
      x.name.toLowerCase().includes(s) || x.area.toLowerCase().includes(s)
    ).slice(0, 4);
  }, [q]);

  return (
    <div style={{ padding: '14px 22px 0', position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff',
        border: focused ? '1px solid rgba(14,29,79,0.55)' : '1px solid rgba(15,23,42,0.12)',
        borderRadius: 14, padding: '12px 14px',
        transition: 'border-color .2s ease, box-shadow .2s ease',
        boxShadow: focused ? '0 6px 20px rgba(14,29,79,0.12)' : 'none',
      }}>
        <span style={{ color: '#94a3b8', fontSize: 14 }}>⌕</span>
        <input
          ref={ref}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder="Cari sekolah, area…"
          style={{
            flex: 1, fontSize: 13, color: '#0e1d4f', background: 'transparent',
            border: 'none', outline: 'none', fontFamily: 'inherit',
            padding: 0, minWidth: 0,
          }}
        />
        <Pressable onClick={onAreaClick} scale={0.92}
          style={{
            fontSize: 10.5, fontWeight: 700, color: '#fff',
            background: '#0e1d4f', padding: '6px 10px', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 4, letterSpacing: 0.4,
          }}>
          📍 {area.toUpperCase()}
        </Pressable>
      </div>
      {/* suggestion dropdown */}
      {focused && matches.length > 0 && (
        <div style={{
          position: 'absolute', left: 22, right: 22, top: 'calc(100% + 6px)',
          background: '#fff', borderRadius: 12,
          border: '1px solid rgba(15,23,42,0.1)',
          boxShadow: '0 18px 40px rgba(15,23,42,0.18)',
          zIndex: 20, overflow: 'hidden',
        }}>
          {matches.map((m, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderBottom: i < matches.length - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                fontSize: 8.5, fontWeight: 800, color: 'var(--tk-accent, #c47a14)',
                letterSpacing: 0.8, width: 60,
              }}>{m.tag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0e1d4f' }}>{m.name}</div>
                <div style={{ fontSize: 10.5, color: '#94a3b8' }}>{m.area}</div>
              </div>
              <Chev size={12} stroke={2}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── feature cards (square pair) — now with photo + expand on tap ───────────
function FeatureSquare({ idx, title, count, sub, photo, tone, accent, expanded, onToggle }) {
  return (
    <Pressable onClick={onToggle} scale={0.97}
      style={{
        aspectRatio: '1/1.05', borderRadius: 6, position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(15,23,42,0.18)',
        boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
      }}>
      {/* photo */}
      <img src={photo} alt={title}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', transition: 'transform .6s cubic-bezier(.2,.7,.3,1)',
          transform: expanded ? 'scale(1.08)' : 'scale(1)',
        }}/>
      {/* tone overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: tone, mixBlendMode: 'multiply',
      }}/>
      {/* darken bottom */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)',
      }}/>
      {/* content */}
      <div style={{
        position: 'relative', height: '100%', padding: 14, color: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, opacity: 0.95 }}>
            NO. {idx}
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700,
            letterSpacing: 0.5, color: accent,
          }}>★ FITUR</span>
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--tk-font-display)', fontWeight: 700, fontSize: 26,
            letterSpacing: -0.5, lineHeight: 1,
          }}>{title}</div>
          <div style={{ fontSize: 10.5, opacity: 0.92, marginTop: 6, lineHeight: 1.35,
                         maxHeight: expanded ? 60 : 28, overflow: 'hidden',
                         transition: 'max-height .35s ease' }}>{sub}</div>
          <div style={{
            marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.28)',
          }}>
            <span style={{
              fontFamily: 'var(--tk-font-display)', fontSize: 22, fontWeight: 700, color: accent,
            }}>{count}<span style={{ fontSize: 10.5, opacity: 0.95, fontWeight: 700, marginLeft: 4 }}>tempat</span></span>
            <span style={{
              width: 28, height: 28, borderRadius: 999, background: '#fff7ec',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
              transition: 'transform .3s ease',
            }}><Chev color="#0e1d4f"/></span>
          </div>
        </div>
      </div>
    </Pressable>
  );
}

// ─── masthead w/ scroll-aware kids polaroid ─────────────────────────────────
function Masthead({ scrollY, showConfetti = true }) {
  // kids tilt slightly with scroll (parallax)
  const tilt = Math.max(-10, -4 - scrollY * 0.04);
  const fade = Math.max(0, 1 - scrollY * 0.01);
  return (
    <div style={{ padding: '54px 22px 0', position: 'relative' }}>
      {/* confetti — fades on scroll */}
      {showConfetti && (
      <svg width="100%" height="170" viewBox="0 0 346 170"
           style={{ position: 'absolute', left: 0, top: 40, pointerEvents: 'none', opacity: fade }}>
        <circle cx="40" cy="50" r="6" fill="#f6b545"/>
        <rect x="80" y="22" width="10" height="10" fill="#1f9b6a" transform="rotate(20 85 27)"/>
        <path d="M280 30 l8 4 l-3 9 l-9 -2 z" fill="#e26a6a"/>
        <circle cx="320" cy="60" r="4" fill="#1e3fb0"/>
        <path d="M14 110 q6 -8 14 0 t14 0" stroke="#c47a14" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M300 130 l10 -6 l4 10 l-10 4 z" fill="#7a4f9b" opacity="0.6"/>
        <path d="M180 18 l2 6 l6 1 l-5 4 l2 6 l-5 -4 l-5 4 l2 -6 l-5 -4 l6 -1 z" fill="#f6b545"/>
      </svg>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8' }}>
          EDISI · MINGGU 18 — MEI 2026
        </div>
        <Pressable scale={0.92} style={{
          width: 32, height: 32, borderRadius: 999, background: '#0e1d4f',
          color: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12, fontWeight: 700,
        }}>R</Pressable>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 0, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--tk-font-display)', fontWeight: 700, fontSize: 60,
            letterSpacing: -2.2, lineHeight: 0.92, color: '#0e1d4f',
          }}>Tangsel<span style={{ color: 'var(--tk-accent, #c47a14)' }}>.</span></div>
          <div style={{
            fontFamily: 'var(--tk-font-display)', fontStyle: 'italic',
            fontWeight: 500, fontSize: 24, color: '#0e1d4f', opacity: 0.7, marginTop: -2,
          }}>Kids — Bintaro</div>
        </div>
        <KidPolaroids tilt={tilt}/>
      </div>

      <div style={{
        marginTop: 16, paddingTop: 14,
        borderTop: '1px solid rgba(15,23,42,0.18)',
        fontSize: 12.5, color: '#475569', lineHeight: 1.5, fontStyle: 'italic',
      }}>
        <span style={{ fontWeight: 700, color: '#0e1d4f', fontStyle: 'normal' }}>Dari redaksi.</span>{' '}
        <AnimatedCounter value={57}/> tempat terkurasi — sekolah, daycare, taman bermain. Pilih dengan tenang.
      </div>
    </div>
  );
}

function AnimatedCounter({ value }) {
  const v = useAnimatedNumber(value, 1100);
  return <b style={{ color: '#0e1d4f', fontStyle: 'normal' }}>{v}</b>;
}

// kids polaroid stack — real photos behind paper tape
function KidPolaroids({ tilt = -4 }) {
  return (
    <div style={{ position: 'relative', width: 130, height: 140, marginRight: -6 }}>
      {/* back card */}
      <div style={{
        position: 'absolute', right: 0, top: 12, width: 78, height: 96,
        background: '#fff7ec', padding: 5, paddingBottom: 14,
        border: '1px solid rgba(15,23,42,0.12)',
        boxShadow: '0 8px 18px rgba(15,23,42,0.16)',
        transform: `rotate(${6 - tilt * 0.2}deg)`,
        transition: 'transform .3s ease',
      }}>
        <img src={PHOTOS.kid2} alt=""
          style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block',
                   filter: 'saturate(0.95)' }}/>
        <div style={{
          position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center',
          fontFamily: 'var(--tk-font-display)', fontStyle: 'italic',
          fontSize: 9.5, color: '#0e1d4f',
        }}>Bumi · 6</div>
      </div>
      {/* front card */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 84, height: 102,
        background: '#fff7ec', padding: 5, paddingBottom: 14,
        border: '1px solid rgba(15,23,42,0.12)',
        boxShadow: '0 12px 22px rgba(15,23,42,0.18)',
        transform: `rotate(${tilt}deg)`,
        transition: 'transform .3s ease',
      }}>
        {/* tape */}
        <div aria-hidden style={{
          position: 'absolute', top: -8, left: '25%', right: '25%', height: 14,
          background: '#f6b545', opacity: 0.85,
          transform: 'rotate(-6deg)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
        }}/>
        <img src={PHOTOS.kid1} alt=""
          style={{ width: '100%', height: 76, objectFit: 'cover', display: 'block',
                   filter: 'saturate(1.05) contrast(1.02)' }}/>
        <div style={{
          position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center',
          fontFamily: 'var(--tk-font-display)', fontStyle: 'italic',
          fontSize: 10, color: '#0e1d4f',
        }}>Aira · 4</div>
      </div>
    </div>
  );
}

// ─── feature pair w/ expand ────────────────────────────────────────────────
function FeaturePair() {
  const [open, setOpen] = useState(null); // 'sekolah' | 'kursus' | null

  return (
    <div style={{ padding: '28px 22px 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8' }}>
          FITUR UTAMA · KAMU CARI APA?
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tk-accent, #c47a14)',
                       letterSpacing: 0.4 }}>Lihat semua →</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <FeatureSquare
          idx="01" title="Sekolah" count="9"
          sub="TK · SD · SMP · SMA — kurikulum nasional, internasional & alam."
          photo={PHOTOS.sekolah}
          tone="linear-gradient(165deg,rgba(58,100,238,0.85) 0%,rgba(30,63,176,0.92) 100%)"
          accent="#f6b545"
          expanded={open === 'sekolah'}
          onToggle={() => setOpen(open === 'sekolah' ? null : 'sekolah')}/>
        <FeatureSquare
          idx="02" title="Tempat Kursus" count="6"
          sub="English · Math · Art · Music · Coding — kelas privat & grup."
          photo={PHOTOS.kursus}
          tone="linear-gradient(165deg,rgba(42,125,98,0.85) 0%,rgba(31,155,106,0.92) 100%)"
          accent="#7af0b6"
          expanded={open === 'kursus'}
          onToggle={() => setOpen(open === 'kursus' ? null : 'kursus')}/>
      </div>
      {/* peek-sheet */}
      <div style={{
        marginTop: open ? 12 : 0,
        maxHeight: open ? 200 : 0,
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height .4s ease, opacity .3s ease, margin-top .3s ease',
      }}>
        <PeekSheet kind={open}/>
      </div>
    </div>
  );
}

function PeekSheet({ kind }) {
  const data = kind === 'sekolah'
    ? { title: 'Filter cepat — Sekolah', chips: ['TK', 'SD', 'SMP', 'SMA', 'Internasional', 'Sekolah Alam', 'Bintaro 7', 'Bintaro 9', 'BSD'] }
    : { title: 'Filter cepat — Kursus', chips: ['English', 'Mandarin', 'Math', 'Art', 'Music', 'Coding', 'Robotik', 'Privat', 'Grup'] };
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(15,23,42,0.12)',
      borderRadius: 8, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: '#94a3b8' }}>
        {data.title.toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {data.chips.map((c) => (
          <span key={c} style={{
            fontSize: 11, fontWeight: 600, padding: '6px 10px',
            background: '#f6f1e8', color: '#0e1d4f', borderRadius: 999,
            border: '1px solid rgba(15,23,42,0.08)',
          }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

// ─── index list ─────────────────────────────────────────────────────────────
const otherCats = [
  ['03', 'Daycares', '11 tempat'],
  ['04', 'Playgrounds', '8 tempat'],
  ['05', 'Klinik Tumbuh Kembang', '4 tempat'],
  ['06', 'Kafe Ramah Anak', '7 tempat'],
  ['07', 'Bermain Dengan Binatang', '3 tempat'],
  ['08', 'Kolam Renang & Waterparks', '5 tempat'],
  ['09', 'Toko Buku & Alat Tulis', '2 tempat'],
  ['—', 'Lainnya', '+ 4 kategori'],
];

function IndexList() {
  return (
    <div style={{ padding: '28px 22px 0' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8' }}>
        INDEKS — KATEGORI LAIN
      </div>
      <div style={{ marginTop: 12, borderTop: '1px solid rgba(15,23,42,0.18)' }}>
        {otherCats.map(([n, name, count]) => (
          <Pressable key={name} scale={0.99} style={{
            display: 'flex', alignItems: 'baseline', gap: 14, padding: '11px 0',
            borderBottom: '1px solid rgba(15,23,42,0.08)',
          }}>
            <span style={{
              fontFamily: 'var(--tk-font-display)', fontSize: 13, fontWeight: 700,
              color: 'var(--tk-accent, #c47a14)', width: 22, fontVariantNumeric: 'tabular-nums',
            }}>{n}</span>
            <span style={{
              flex: 1, fontFamily: 'var(--tk-font-display)', fontSize: 17,
              fontWeight: 600, color: '#0e1d4f', letterSpacing: -0.2,
            }}>{name}</span>
            <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>{count}</span>
            <Chev stroke={2}/>
          </Pressable>
        ))}
      </div>
    </div>
  );
}

// ─── cover story w/ real photo + save toggle ────────────────────────────────
function CoverStory() {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ padding: '28px 22px 0' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8' }}>
        COVER STORY · TEMPAT UNGGULAN
      </div>
      <div style={{
        marginTop: 12, borderRadius: 6, overflow: 'hidden',
        border: '1px solid rgba(15,23,42,0.12)', background: '#fff',
      }}>
        <div style={{
          aspectRatio: '4/3', position: 'relative', overflow: 'hidden',
        }}>
          <img src={PHOTOS.cover} alt="Little Stars Montessori"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
            }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(14,29,79,0.05) 30%, rgba(14,29,79,0.75) 100%)',
          }}/>
          <span style={{
            position: 'absolute', top: 14, left: 14, fontSize: 9.5, fontWeight: 800,
            padding: '4px 9px', background: '#0e1d4f', color: '#f6f1e8', letterSpacing: 0.6,
          }}>★ EDITOR'S PICK NO. 01</span>
          <Pressable onClick={() => setSaved(!saved)} scale={0.85}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 34, height: 34, borderRadius: 999,
              background: 'rgba(255,255,255,0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
            }}>
            <span style={{ transform: saved ? 'scale(1.18)' : 'scale(1)',
                            transition: 'transform .25s cubic-bezier(.5,1.6,.4,1)' }}>
              <Heart filled={saved}/>
            </span>
          </Pressable>
          <div style={{
            position: 'absolute', bottom: 16, left: 16, color: '#fff',
            fontFamily: 'var(--tk-font-display)', fontSize: 30, fontWeight: 700,
            letterSpacing: -0.6, lineHeight: 1, maxWidth: 240,
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}>Little Stars Montessori</div>
          <div style={{
            position: 'absolute', bottom: 12, right: 16, fontSize: 10.5,
            color: 'rgba(255,255,255,0.95)', fontWeight: 600,
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
          }}>📍 Bintaro Sektor 7</div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.55, fontStyle: 'italic' }}>
            "Kurikulum Montessori dengan guru bersertifikat. Kelas kecil, halaman luas — favorit redaksi minggu ini."
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: '#94a3b8',
                         alignItems: 'center' }}>
            <span><b style={{ color: '#0e1d4f' }}>★ 4.9</b> · 47 ulasan</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#0e1d4f' }}>Rp 2.5jt /bln</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── article list w/ thumbnails ─────────────────────────────────────────────
function ArticleList() {
  const items = [
    ['Parenting', '5 Cara Mengajarkan Anak Mengelola Emosi', '3 Apr · 4 menit', PHOTOS.art1],
    ['Sekolah', 'Sekolah Terbaik di Bintaro: Panduan Lengkap 2026', '20 Apr · 7 menit', PHOTOS.art2],
    ['Aktivitas', 'Aktivitas Seru Akhir Pekan Bersama Anak di Tangsel', '15 Apr · 5 menit', PHOTOS.art3],
  ];
  return (
    <div style={{ padding: '28px 22px 0' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8' }}>
        BERITA & ARTIKEL
      </div>
      <div style={{ marginTop: 14, borderTop: '1px solid rgba(15,23,42,0.18)' }}>
        {items.map(([tag, title, meta, photo]) => (
          <Pressable key={title} scale={0.99} style={{
            padding: '14px 0', borderBottom: '1px solid rgba(15,23,42,0.08)',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--tk-accent, #c47a14)', letterSpacing: 0.7 }}>
                {tag.toUpperCase()}
              </div>
              <div style={{
                fontFamily: 'var(--tk-font-display)', fontSize: 16, fontWeight: 700,
                color: '#0e1d4f', letterSpacing: -0.2, marginTop: 4, lineHeight: 1.2,
              }}>{title}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{meta}</div>
            </div>
            <img src={photo} alt=""
              style={{
                width: 72, height: 72, objectFit: 'cover', borderRadius: 4,
                border: '1px solid rgba(15,23,42,0.08)', flexShrink: 0,
              }}/>
          </Pressable>
        ))}
      </div>
    </div>
  );
}

function DaftarCard() {
  return (
    <div style={{ padding: '24px 22px 0' }}>
      <div style={{
        border: '1px solid rgba(15,23,42,0.18)', borderRadius: 4,
        padding: '18px 18px', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.6, color: '#94a3b8' }}>
            UNTUK PEMILIK TEMPAT
          </div>
          <div style={{ fontFamily: 'var(--tk-font-display)', fontWeight: 700,
                         fontSize: 18, color: '#0e1d4f', marginTop: 4, letterSpacing: -0.2 }}>
            Daftarkan tempatmu.
          </div>
        </div>
        <Pressable scale={0.94} style={{
          background: '#0e1d4f', color: '#fff', border: 'none',
          padding: '10px 14px', borderRadius: 4, fontWeight: 700, fontSize: 12,
        }}>Daftar →</Pressable>
      </div>
    </div>
  );
}

function FooterMark() {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 0', fontSize: 9.5,
                   fontWeight: 700, letterSpacing: 1, color: '#94a3b8' }}>
      TANGSELKIDS · EDISI MEI 2026
    </div>
  );
}

// ─── sticky mini-masthead (appears on scroll) ───────────────────────────────
function StickyHeader({ visible }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      opacity: visible ? 1 : 0,
      transition: 'transform .3s ease, opacity .25s ease',
      background: 'rgba(246,241,232,0.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(15,23,42,0.1)',
      padding: '50px 22px 10px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{
        fontFamily: 'var(--tk-font-display)', fontWeight: 700, fontSize: 22,
        letterSpacing: -1, color: '#0e1d4f', lineHeight: 1,
      }}>Tangsel<span style={{ color: 'var(--tk-accent, #c47a14)' }}>.</span>
        <span style={{ fontStyle: 'italic', fontSize: 14, fontWeight: 500, opacity: 0.7,
                        marginLeft: 4 }}>Kids</span>
      </div>
      <div style={{
        fontSize: 10.5, fontWeight: 700, color: '#fff',
        background: '#0e1d4f', padding: '5px 9px', borderRadius: 8, letterSpacing: 0.4,
      }}>📍 BINTARO</div>
    </div>
  );
}

// ─── empty tab states ───────────────────────────────────────────────────────
function StubScreen({ tab }) {
  const titles = {
    search: ['JELAJAH', 'Cari tempat', 'Telusuri 57 tempat terkurasi.'],
    save: ['TERSIMPAN', 'Belum ada simpanan', 'Tap ♡ pada cover story untuk menyimpan.'],
    user: ['PROFIL', 'Halo, Ratri', 'Bintaro 7 · 2 anak terdaftar'],
  };
  const [eyebrow, h, sub] = titles[tab];
  return (
    <div style={{ padding: '90px 28px 30px' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8' }}>{eyebrow}</div>
      <div style={{
        fontFamily: 'var(--tk-font-display)', fontWeight: 700, fontSize: 40,
        letterSpacing: -1.4, lineHeight: 1, color: '#0e1d4f', marginTop: 8,
      }}>{h}<span style={{ color: 'var(--tk-accent, #c47a14)' }}>.</span></div>
      <div style={{ marginTop: 14, fontSize: 13, color: '#475569', lineHeight: 1.5,
                     fontStyle: 'italic' }}>{sub}</div>
    </div>
  );
}

// ─── main ───────────────────────────────────────────────────────────────────
function HomeV1Polished({ accent = 'amber', showConfetti = true } = {}) {
  const [tab, setTab] = useState('home');
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef(null);

  const showSticky = scrollY > 140;

  return (
    <Shell>
      <StickyHeader visible={showSticky}/>
      {tab === 'home' ? (
        <div
          ref={scrollRef}
          onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}
          style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
          <Masthead scrollY={scrollY} showConfetti={showConfetti}/>
          <SearchBar area="Bintaro" onAreaClick={() => {}}/>
          <FeaturePair/>
          <IndexList/>
          <CoverStory/>
          <ArticleList/>
          <DaftarCard/>
          <FooterMark/>
        </div>
      ) : (
        <StubScreen tab={tab}/>
      )}
      <TabBar active={tab} onSwitch={setTab}/>
    </Shell>
  );
}

Object.assign(window, { HomeV1Polished });
