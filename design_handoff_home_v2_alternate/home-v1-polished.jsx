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
function FeatureSquare({ idx, title, count, sub, photo, tone, accent, expanded, onToggle, onChevron }) {
  return (
    <Pressable onClick={onToggle} scale={0.97}
      style={{
        aspectRatio: '1/1.1', borderRadius: 6, position: 'relative',
        overflow: 'hidden',
        border: expanded ? `1.5px solid ${accent}` : '1px solid rgba(15,23,42,0.18)',
        boxShadow: expanded ? `0 14px 30px ${accent}55` : '0 12px 28px rgba(15,23,42,0.12)',
        transition: 'border-color .25s ease, box-shadow .25s ease',
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
      {/* content — anchored to bottom */}
      <div style={{
        position: 'absolute', inset: 0, padding: '14px 14px 16px', color: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        boxSizing: 'border-box',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--tk-font-display)', fontWeight: 700, fontSize: 24,
            letterSpacing: -0.5, lineHeight: 1,
          }}>{title}</div>
          <div style={{ fontSize: 10.5, opacity: 0.92, marginTop: 6, lineHeight: 1.35,
                         maxHeight: expanded ? 60 : 28, overflow: 'hidden',
                         transition: 'max-height .35s ease' }}>{sub}</div>
          <div style={{
            marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.28)',
          }}>
            <span style={{
              fontFamily: 'var(--tk-font-display)', fontSize: 20, fontWeight: 700, color: accent,
            }}>{count}<span style={{ fontSize: 10.5, opacity: 0.95, fontWeight: 700, marginLeft: 4 }}>tempat</span></span>
            <Pressable scale={0.85} onClick={(e) => { e?.stopPropagation?.(); onChevron?.(); }}
              style={{
                width: 26, height: 26, borderRadius: 999, background: '#fff7ec',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform .3s ease',
              }}><Chev color="#0e1d4f"/></Pressable>
          </div>
        </div>
      </div>
    </Pressable>
  );
}

// ─── area selector — inline under feature card ─────────────────────────────
const AREAS = [
  { key: 'Bintaro',    counts: { sekolah: 5,  kursus: 4 } },
  { key: 'BSD',        counts: { sekolah: 4,  kursus: 2 } },
  { key: 'Semua', counts: { sekolah: 9,  kursus: 6 } },
];

function AreaPills({ category, value, onPick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: '#94a3b8',
      }}>
        DI MANA?
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {AREAS.map((a) => {
          const active = value === a.key;
          return (
            <Pressable key={a.key} scale={0.94} onClick={() => onPick(a.key)}
              style={{
                flex: 1,
                padding: '11px 8px',
                borderRadius: 999,
                border: active ? '1px solid #0e1d4f' : '1px solid rgba(15,23,42,0.16)',
                background: active ? '#0e1d4f' : '#fff',
                color: active ? '#fff' : '#475569',
                fontSize: 11, fontWeight: 700,
                textAlign: 'center',
                transition: 'all .2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6,
              }}>
              <span style={{ fontFamily: 'var(--tk-font-display)', letterSpacing: -0.2,
                              fontSize: 14, fontWeight: 700 }}>
                {a.key}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, opacity: active ? 0.85 : 0.7,
                fontVariantNumeric: 'tabular-nums',
              }}>{a.counts[category] || 0}</span>
            </Pressable>
          );
        })}
      </div>
    </div>
  );
}

// ─── language toggle (ID / EN) ─────────────────────────────────────────────
function LangToggle() {
  const [lang, setLang] = useState('ID');
  return (
    <div style={{
      display: 'flex',
      border: '1px solid rgba(15,23,42,0.18)',
      borderRadius: 999,
      padding: 1.5,
      background: '#fff',
      fontSize: 8.5,
      fontWeight: 800,
      letterSpacing: 0.4,
    }}>
      {['ID', 'EN'].map((code) => {
        const active = lang === code;
        return (
          <Pressable key={code} scale={0.9} onClick={() => setLang(code)}
            style={{
              padding: '2px 6px',
              borderRadius: 999,
              background: active ? '#0e1d4f' : 'transparent',
              color: active ? '#fff' : '#94a3b8',
              transition: 'background .2s ease, color .2s ease',
            }}>
            {code}
          </Pressable>
        );
      })}
    </div>
  );
}

// ─── confetti — sparse cut-paper scraps behind masthead ───────────────────
function Confetti() {
  // positions tuned to avoid the logo (top-left), wordmark, and avatar (top-right)
  // each scrap: { type, top, left, rotate, color, size }
  const scraps = [
    { type: 'rect',   top:  10, left:  60, rot: -18, color: '#ef6f6c', w: 14, h: 5 },
    { type: 'dot',    top:  22, left: 200, rot:   0, color: '#1f9b6a', w: 7,  h: 7 },
    { type: 'squig',  top:  46, left: 280, rot:  12, color: '#3a64ee' },
    { type: 'tri',    top:   8, left: 250, rot:  20, color: '#f6b545', w: 10, h: 10 },
    { type: 'rect',   top:  92, left:  18, rot:  28, color: '#3a64ee', w: 12, h: 4 },
    { type: 'cross',  top: 122, left: 300, rot:   0, color: '#ef6f6c' },
    { type: 'dot',    top: 132, left:  58, rot:   0, color: '#f6b545', w: 6,  h: 6 },
    { type: 'rect',   top: 168, left: 252, rot:  -8, color: '#1f9b6a', w: 10, h: 4 },
    { type: 'tri',    top: 195, left:  20, rot: -14, color: '#9c5a7a', w: 9,  h: 9 },
    { type: 'dot',    top: 210, left: 290, rot:   0, color: '#3a64ee', w: 5,  h: 5 },
  ];
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      zIndex: 0,
    }}>
      {scraps.map((s, i) => {
        const base = {
          position: 'absolute', top: s.top, left: s.left,
          transform: `rotate(${s.rot}deg)`, opacity: 0.9,
        };
        if (s.type === 'rect') {
          return <span key={i} style={{ ...base, width: s.w, height: s.h, background: s.color, borderRadius: 1 }}/>;
        }
        if (s.type === 'dot') {
          return <span key={i} style={{ ...base, width: s.w, height: s.h, background: s.color, borderRadius: 999 }}/>;
        }
        if (s.type === 'tri') {
          return (
            <svg key={i} width={s.w} height={s.h} viewBox="0 0 10 10" style={base}>
              <polygon points="5,0 10,10 0,10" fill={s.color}/>
            </svg>
          );
        }
        if (s.type === 'cross') {
          return (
            <svg key={i} width="10" height="10" viewBox="0 0 10 10" style={base}>
              <path d="M0 5 H10 M5 0 V10" stroke={s.color} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          );
        }
        if (s.type === 'squig') {
          return (
            <svg key={i} width="14" height="6" viewBox="0 0 14 6" style={base}>
              <path d="M1 3 Q3.5 0 7 3 T13 3" stroke={s.color} strokeWidth="1.6" fill="none" strokeLinecap="round"/>
            </svg>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── masthead — compact (no confetti, no edisi date, no kid polaroids) ──────
function Masthead({ scrollY, showConfetti = true }) {
  return (
    <React.Fragment>
    <div style={{ padding: '64px 22px 0', position: 'relative' }}>
      {/* confetti removed */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', gap: 12 }}>
        <Logo/>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--tk-font-display)', fontWeight: 700, fontSize: 38,
            letterSpacing: -1.4, lineHeight: 0.95, color: '#0e1d4f',
          }}>Tangsel<span style={{ color: 'var(--tk-accent, #c47a14)' }}>.</span></div>
          <div style={{
            fontFamily: 'var(--tk-font-display)', fontStyle: 'italic',
            fontWeight: 500, fontSize: 24, color: '#0e1d4f', opacity: 0.7,
            marginTop: -2, letterSpacing: 4,
          }}>Kids</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Pressable scale={0.92} style={{
            width: 26, height: 26, borderRadius: 999, background: '#0e1d4f',
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11, fontWeight: 700,
          }}>R</Pressable>
          <LangToggle/>
        </div>
      </div>
      <div style={{
        marginTop: 14,
        fontSize: 12.5,
        lineHeight: 1.45,
        color: '#475569',
        maxWidth: 320,
      }}>
        Direktori cerdas untuk orang tua di{' '}
        <b style={{ color: 'var(--tk-accent, #1f9b6a)', fontWeight: 700 }}>Bintaro</b> dan{' '}
        <b style={{ color: 'var(--tk-accent, #1f9b6a)', fontWeight: 700 }}>BSD</b>.
      </div>
    </div>
    {/* full-bleed typewriter band */}
    <Typewriter/>
    </React.Fragment>
  );
}

// ─── logo ──────────────────────────────────────────────────────────────────
// Editorial badge: a tilted "paper" square with a kite/star + a smile,
// stamped TK monogram. Cut-paper aesthetic to match the rest.
function Logo() {
  return (
    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
      <svg viewBox="0 0 52 52" width="52" height="52">
        {/* tilted square paper */}
        <g transform="rotate(-6 26 26)">
          <rect x="3" y="3" width="46" height="46" rx="4"
                fill="var(--tk-accent, #c47a14)"/>
          {/* tape */}
          <rect x="18" y="-2" width="16" height="6" rx="1"
                fill="#f6b545" opacity="0.9"
                transform="rotate(8 26 1)"/>
        </g>
        {/* sun rays burst, centered */}
        <g stroke="#fff7ec" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M26 8 v3"/>
          <path d="M26 41 v3"/>
          <path d="M8 26 h3"/>
          <path d="M41 26 h3"/>
          <path d="M14 14 l2 2"/>
          <path d="M36 36 l2 2"/>
          <path d="M38 14 l-2 2"/>
          <path d="M16 36 l-2 2"/>
        </g>
        {/* friendly star face in the middle */}
        <g transform="translate(26 26)">
          <path d="M0 -10 l2.6 6 l6.4 .9 l-4.7 4.4 l1.2 6.4 l-5.5 -3.2 l-5.5 3.2 l1.2 -6.4 l-4.7 -4.4 l6.4 -.9 z"
                fill="#0e1d4f"/>
          {/* eyes */}
          <circle cx="-2" cy="-2" r="0.9" fill="#fff7ec"/>
          <circle cx="2" cy="-2" r="0.9" fill="#fff7ec"/>
          {/* smile */}
          <path d="M-2 1.5 q2 1.6 4 0" stroke="#fff7ec" strokeWidth="0.9"
                fill="none" strokeLinecap="round"/>
        </g>
      </svg>
    </div>
  );
}

function AnimatedCounter({ value }) {
  const v = useAnimatedNumber(value, 1100);
  return <b style={{ color: '#0e1d4f', fontStyle: 'normal' }}>{v}</b>;
}

// ─── typewriter tagline — cycles category words ────────────────────────────
const TYPE_WORDS = [
  'sekolah', 'tempat kursus', 'daycare', 'playground',
  'Klinik Anak', 'kafe ramah anak', 'kolam renang',
];

function Typewriter() {
  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | holding | deleting
  const [caretOn, setCaretOn] = useState(true);

  // caret blink
  useEffect(() => {
    const t = setInterval(() => setCaretOn((v) => !v), 520);
    return () => clearInterval(t);
  }, []);

  // typewriter loop
  useEffect(() => {
    const word = TYPE_WORDS[wordIdx];
    let timer;
    if (phase === 'typing') {
      if (text.length < word.length) {
        timer = setTimeout(() => setText(word.slice(0, text.length + 1)), 55);
      } else {
        timer = setTimeout(() => setPhase('deleting'), 1500);
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timer = setTimeout(() => setText(word.slice(0, text.length - 1)), 32);
      } else {
        timer = setTimeout(() => {
          setWordIdx((i) => (i + 1) % TYPE_WORDS.length);
          setPhase('typing');
        }, 260);
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, wordIdx]);

  return (
    <div style={{
      marginTop: 12,
      background: '#fff7ec',
      borderTop: '1px solid rgba(15,23,42,0.1)',
      borderBottom: '1px solid rgba(15,23,42,0.1)',
      padding: '14px 22px',
      fontSize: 17, color: '#475569',
      lineHeight: 1.3,
      fontFamily: 'var(--tk-font-display)',
      fontWeight: 500,
    }}>
      Temukan{' '}
      <span style={{
        color: '#0e1d4f', fontWeight: 700, fontStyle: 'italic',
      }}>
        {text}
        <span style={{
          display: 'inline-block', width: 2, height: '0.95em',
          background: 'var(--tk-accent, #c47a14)',
          marginLeft: 2, verticalAlign: '-2px',
          opacity: caretOn ? 1 : 0,
          transition: 'opacity .08s linear',
        }}/>
      </span>
      {' '}yang tepat.
    </div>
  );
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
  const [area, setArea] = useState(null); // 'Bintaro' | 'BSD' | 'Semua Area' | null

  const toggleCard = (k) => {
    if (open === k) {
      setOpen(null);
      setArea(null);
    } else {
      setOpen(k);
      setArea(null); // reset area when switching cards
    }
  };

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
          onToggle={() => toggleCard('sekolah')}
          onChevron={() => { /* route to category page */ }}/>
        <FeatureSquare
          idx="02" title="Tempat Kursus" count="6"
          sub="English · Math · Art · Music · Coding — kelas privat & grup."
          photo={PHOTOS.kursus}
          tone="linear-gradient(165deg,rgba(42,125,98,0.85) 0%,rgba(31,155,106,0.92) 100%)"
          accent="#7af0b6"
          expanded={open === 'kursus'}
          onToggle={() => toggleCard('kursus')}
          onChevron={() => { /* route to category page */ }}/>
      </div>
      {/* tier 1 — area pills */}
      <div style={{
        marginTop: open ? 14 : 0,
        maxHeight: open ? 90 : 0,
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height .35s ease, opacity .25s ease, margin-top .3s ease',
      }}>
        {open && (
          <AreaPills category={open} value={area} onPick={setArea}/>
        )}
      </div>
      {/* tier 2 — age rail */}
      <div style={{
        marginTop: open && area ? 14 : 0,
        maxHeight: open && area ? 160 : 0,
        opacity: open && area ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height .4s ease, opacity .3s ease, margin-top .3s ease',
      }}>
        {open && area && <AgeBands category={open} area={area}/>}
      </div>
    </div>
  );
}

// ─── age bands — opens under a feature card ──────────────────────────────
// Sekolah → school levels (label) + age range (sub)
// Kursus  → age bands (label) + life-stage (sub)
const AREA_MULT = { 'Bintaro': 1.0, 'BSD': 0.78, 'Semua': 1.7 };

const SCHOOL_LEVELS = [
  { label: 'Preschool', sub: '2–4 thn',  dot: '#f59e0b', count: 2 },
  { label: 'TK',        sub: '4–6 thn',  dot: '#ef6f6c', count: 3 },
  { label: 'SD',        sub: '6–12 thn', dot: '#1f9b6a', count: 5 },
  { label: 'SMP',       sub: '12–15 thn',dot: '#3a64ee', count: 3 },
  { label: 'SMA',       sub: '15–18 thn',dot: '#9c5a7a', count: 2 },
];

const KURSUS_AGES = [
  { label: 'Bayi',         sub: '0–1 thn',  dot: '#f59e0b', count: 1 },
  { label: 'Toddler',      sub: '1–3 thn',  dot: '#ef6f6c', count: 2 },
  { label: 'Preschooler',  sub: '3–6 thn',  dot: '#1f9b6a', count: 3 },
  { label: 'Pre-Teen',     sub: '6–12 thn', dot: '#3a64ee', count: 4 },
  { label: 'Teenager',     sub: '12+ thn',   dot: '#9c5a7a', count: 2 },
];

function AgeBands({ category, area }) {
  const railRef = useRef(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanL(el.scrollLeft > 4);
    setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    const id = requestAnimationFrame(updateArrows);
    return () => cancelAnimationFrame(id);
  }, [category, area]);

  const nudge = (dir) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 140, behavior: 'smooth' });
  };

  const mult = AREA_MULT[area] ?? 1;
  const data = category === 'sekolah' ? SCHOOL_LEVELS : KURSUS_AGES;
  const eyebrow = category === 'sekolah' ? 'JENJANG SEKOLAH' : 'UNTUK USIA BERAPA?';

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: '#94a3b8',
        marginBottom: 8,
      }}>
        {eyebrow}
      </div>
      <div style={{ position: 'relative' }}>
        <div ref={railRef} onScroll={updateArrows}
          style={{
            display: 'flex', gap: 10,
            overflowX: 'auto', overflowY: 'hidden',
            padding: '4px 2px 8px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            margin: '0 -22px',
            paddingLeft: 22, paddingRight: 22,
          }}>
          <style>{`.tk-age-rail::-webkit-scrollbar{display:none}`}</style>
          {data.map((b) => {
            const n = Math.max(1, Math.round(b.count * mult));
            return (
              <Pressable key={b.label} scale={0.94}
                onClick={() => { /* route to category w/ filter */ }}
                style={{
                  flexShrink: 0,
                  display: 'flex', flexDirection: 'column', gap: 4,
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(15,23,42,0.14)',
                  background: '#fff',
                  transition: 'all .2s ease',
                  minWidth: 96,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 999, background: b.dot,
                    boxShadow: `0 0 0 3px ${b.dot}22`, flexShrink: 0,
                  }}/>
                  <span style={{
                    fontFamily: 'var(--tk-font-display)',
                    fontSize: 14, fontWeight: 700, color: '#0e1d4f',
                    letterSpacing: -0.2, whiteSpace: 'nowrap',
                  }}>{b.label}</span>
                </div>
                <div style={{
                  fontSize: 10, color: '#94a3b8', fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}>
                  {b.sub} · <b style={{ color: '#475569', fontWeight: 700 }}>{n}</b> tempat
                </div>
              </Pressable>
            );
          })}
        </div>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: -22, width: 28,
          background: 'linear-gradient(90deg, #efeae0, rgba(239,234,224,0))',
          opacity: canL ? 1 : 0, transition: 'opacity .2s', pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, right: -22, width: 28,
          background: 'linear-gradient(270deg, #efeae0, rgba(239,234,224,0))',
          opacity: canR ? 1 : 0, transition: 'opacity .2s', pointerEvents: 'none',
        }}/>
        <RailArrow side="left"  show={canL} onClick={() => nudge(-1)}/>
        <RailArrow side="right" show={canR} onClick={() => nudge(1)}/>
      </div>
    </div>
  );
}

function RailArrow({ side, show, onClick }) {
  return (
    <Pressable onClick={onClick} scale={0.88}
      style={{
        position: 'absolute', top: '50%',
        [side]: 6,
        transform: 'translateY(-50%)',
        width: 28, height: 28, borderRadius: 999,
        background: '#fff',
        border: '1px solid rgba(15,23,42,0.14)',
        boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity .2s ease',
        cursor: 'pointer',
      }}>
      <span style={{
        display: 'inline-block',
        transform: side === 'left' ? 'rotate(180deg)' : 'none',
        color: '#0e1d4f',
      }}><Chev stroke={2.2}/></span>
    </Pressable>
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
// editorial line icons — 24px viewBox, ~1.6 stroke, currentColor
const Ico = {
  daycare: (
    // teddy bear — head + ears + tiny face
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="6.5" r="2"/>
      <circle cx="17.5" cy="6.5" r="2"/>
      <circle cx="12" cy="13" r="6"/>
      <circle cx="9.8" cy="12" r="0.8" fill="currentColor"/>
      <circle cx="14.2" cy="12" r="0.8" fill="currentColor"/>
      <path d="M10.5 15.5c.5.6 2.5.6 3 0"/>
    </svg>
  ),
  playground: (
    // playground slide
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20V8"/>
      <path d="M5 8l11-3"/>
      <path d="M16 5v8c0 3-2 5-5 5H7"/>
      <path d="M3 20h18"/>
      <path d="M5 11h-2M5 14h-2M5 17h-2"/>
    </svg>
  ),
  clinic: (
    // stethoscope
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4v6a4 4 0 008 0V4"/>
      <path d="M3 4h3M10 4h3"/>
      <path d="M9 14v2a4 4 0 008 0v-2"/>
      <circle cx="17" cy="18" r="2"/>
    </svg>
  ),
  cafe: (
    // coffee cup with steam
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4c-.5 1 .5 1.5 0 2.5M13 4c-.5 1 .5 1.5 0 2.5"/>
      <path d="M5 10h12v5a4 4 0 01-4 4H9a4 4 0 01-4-4v-5z"/>
      <path d="M17 12h2a2 2 0 010 4h-2"/>
    </svg>
  ),
  animals: (
    // paw print
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="6" cy="9" rx="1.6" ry="2.2"/>
      <ellipse cx="10" cy="6" rx="1.6" ry="2.2"/>
      <ellipse cx="14" cy="6" rx="1.6" ry="2.2"/>
      <ellipse cx="18" cy="9" rx="1.6" ry="2.2"/>
      <path d="M12 11c-3 0-5 2.5-5 5 0 1.5 1 2.5 2.5 2.5 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1.5 0 2.5-1 2.5-2.5 0-2.5-2-5-5-5z"/>
    </svg>
  ),
  pool: (
    // wave / pool
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
      <path d="M2 15c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
      <path d="M2 20c2 0 2-1.5 5-1.5s3 1.5 5 1.5 2-1.5 5-1.5 3 1.5 5 1.5"/>
    </svg>
  ),
  books: (
    // open book
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h7a2 2 0 012 2v12a1.5 1.5 0 00-1.5-1.5H3V5z"/>
      <path d="M21 5h-7a2 2 0 00-2 2v12a1.5 1.5 0 011.5-1.5H21V5z"/>
    </svg>
  ),
  more: (
    // plus / horizontal dots
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="1.4" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.4" fill="currentColor"/>
      <circle cx="18" cy="12" r="1.4" fill="currentColor"/>
    </svg>
  ),
};

const otherCats = [
  ['daycare',    'Daycares',                  '11 tempat'],
  ['playground', 'Playgrounds',               '8 tempat'],
  ['clinic',     'Klinik Tumbuh Kembang',     '4 tempat'],
  ['cafe',       'Kafe Ramah Anak',           '7 tempat'],
  ['animals',    'Bermain Dengan Binatang',   '3 tempat'],
  ['pool',       'Kolam Renang & Waterparks', '5 tempat'],
  ['books',      'Toko Buku & Alat Tulis',    '2 tempat'],
  ['more',       'Lainnya',                   '+ 4 kategori'],
];

function IndexList() {
  return (
    <div style={{ padding: '28px 22px 0' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8' }}>
        INDEKS — KATEGORI LAIN
      </div>
      <div style={{ marginTop: 12, borderTop: '1px solid rgba(15,23,42,0.18)' }}>
        {otherCats.map(([icon, name, count]) => (
          <Pressable key={name} scale={0.99} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0',
            borderBottom: '1px solid rgba(15,23,42,0.08)',
          }}>
            <span style={{
              width: 22, height: 22, color: 'var(--tk-accent, #c47a14)',
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Ico[icon]}</span>
            <span style={{
              flex: 1, fontFamily: 'var(--tk-font-display)', fontSize: 16,
              fontWeight: 600, color: '#0e1d4f', letterSpacing: -0.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{name}</span>
            <span style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 600 }}>{count}</span>
            <Chev stroke={2}/>
          </Pressable>
        ))}
      </div>
    </div>
  );
}

// ─── cover story — 2×2 grid of 4 editor's picks ─────────────────────────────
const COVER_PICKS = [
  { id: 1, name: 'Little Stars Montessori', area: 'Bintaro Sektor 7',
    photo: PHOTOS.cover, rating: 4.9, reviews: 47, price: 'Rp 2.5jt/bln' },
  { id: 2, name: 'Sekolah Alam Bintaro', area: 'Bintaro Sektor 9',
    photo: PHOTOS.sekolah, rating: 4.8, reviews: 62, price: 'Rp 2.1jt/bln' },
  { id: 3, name: 'Wall Street English', area: 'Bintaro X-Change',
    photo: PHOTOS.kursus, rating: 4.7, reviews: 35, price: 'Rp 800rb/bln' },
  { id: 4, name: 'KidZania Tangsel', area: 'BSD Junction',
    photo: PHOTOS.art3, rating: 4.6, reviews: 128, price: 'Rp 250rb' },
];

function CoverStory() {
  const [saved, setSaved] = useState({});
  const toggle = (id) => setSaved((s) => ({ ...s, [id]: !s[id] }));
  return (
    <div style={{ padding: '28px 22px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: '#94a3b8' }}>
          COVER STORY · TEMPAT UNGGULAN
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tk-accent, #c47a14)',
                       letterSpacing: 0.4 }}>Lihat semua →</div>
      </div>
      <div style={{
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {COVER_PICKS.map((p, i) => (
          <CoverCard key={p.id} pick={p} idx={i + 1}
                     saved={!!saved[p.id]} onSave={() => toggle(p.id)}/>
        ))}
      </div>
    </div>
  );
}

function CoverCard({ pick, idx, saved, onSave }) {
  return (
    <Pressable scale={0.97} style={{
      borderRadius: 6, overflow: 'hidden',
      border: '1px solid rgba(15,23,42,0.12)', background: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        aspectRatio: '1/1', position: 'relative', overflow: 'hidden',
      }}>
        <img src={pick.photo} alt={pick.name}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
          }}/>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(14,29,79,0.05) 35%, rgba(14,29,79,0.7) 100%)',
        }}/>
        <span style={{
          position: 'absolute', top: 8, left: 8, fontSize: 8.5, fontWeight: 800,
          padding: '3px 6px', background: '#0e1d4f', color: '#f6f1e8',
          letterSpacing: 0.5,
        }}>★ FEATURED</span>
        <Pressable onClick={(e) => { e?.stopPropagation?.(); onSave(); }} scale={0.82}
          style={{
            position: 'absolute', top: 6, right: 6,
            width: 28, height: 28, borderRadius: 999,
            background: 'rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.18)',
          }}>
          <span style={{ transform: saved ? 'scale(1.18)' : 'scale(1)',
                          transition: 'transform .25s cubic-bezier(.5,1.6,.4,1)' }}>
            <Heart filled={saved}/>
          </span>
        </Pressable>
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10, color: '#fff',
          fontFamily: 'var(--tk-font-display)', fontSize: 16, fontWeight: 700,
          letterSpacing: -0.3, lineHeight: 1.05,
          textShadow: '0 2px 8px rgba(0,0,0,0.45)',
        }}>{pick.name}</div>
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 10.5, color: '#94a3b8', lineHeight: 1.3 }}>
          📍 {pick.area}
        </div>
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'baseline',
          justifyContent: 'space-between', gap: 6,
        }}>
          <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
            <b style={{ color: '#0e1d4f' }}>★ {pick.rating}</b> · {pick.reviews}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#0e1d4f',
            whiteSpace: 'nowrap',
          }}>{pick.price}</span>
        </div>
      </div>
    </Pressable>
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
