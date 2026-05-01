# Handoff: TangselKids — Home Page Redesign

## Overview
Redesign of the TangselKids home page (mobile web). TangselKids is a directory app
helping parents in Bintaro / Tangerang Selatan, Indonesia find schools, daycares,
learning centers, and play places for their kids.

The new direction (**Variation B — Editorial Chunky**) modernizes the surfaces of the
existing app: the same blue/amber palette and same content/IA, but with chunkier
rounded corners, generous whitespace, a serif display face for editorial hierarchy,
and matte (non-glassy) surfaces.

A second exploration (**Variation A — Liquid Glass**) is included for reference only.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes that
show the intended look and behavior, not production code to copy directly. Your task
is to **recreate these HTML designs in TangselKids's existing codebase** (the React
app the user is running on `localhost:3000`), using its established patterns,
component library, and routing.

Do not ship the prototype HTML. Use it as the source of truth for layout, color,
type, spacing, copy, and interaction; reimplement using the project's actual stack.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and component anatomy are all
final. Recreate pixel-perfectly using the codebase's existing component primitives
(buttons, cards, inputs). If the codebase uses Tailwind / shadcn / a design tokens
file, prefer those over hand-rolled CSS.

The prototype targets a 390 × 844 viewport (iPhone 14 Pro logical size). It should
adapt naturally to other phone widths (`min-width: 360px` and up).

---

## Screen: Home

The home page is one continuous vertical scroll with these stacked sections:

1. Hero header (blue panel with wordmark + search)
2. Section header `01 — Kategori` + featured category rows + tile grid
3. "Daftarkan tempat" CTA (dark navy sticker card)
4. Section header `02 — Editor's pick` + 3 featured listings
5. "Aktifkan lokasi" card
6. Footer wordmark
7. Floating bottom tab bar (4 items) — overlays the scroll

### Page-level container
- Background: `#f3efe8` (warm paper) with a subtle two-layer dot grain
  ```css
  background:
    radial-gradient(1px 1px at 20% 30%, rgba(15,23,42,0.04) 50%, transparent 51%) 0 0/14px 14px,
    radial-gradient(1px 1px at 75% 80%, rgba(15,23,42,0.03) 50%, transparent 51%) 0 0/22px 22px,
    linear-gradient(180deg, #f6f1e8 0%, #f3efe8 60%, #efeae0 100%);
  ```
- Body padding-bottom: `110px` (clears the floating tab bar)
- Top spacer: `54px` (clears the iOS status bar — adjust to your safe-area inset)

---

### 1. Hero header

A single big rounded blue panel sitting in 14 px horizontal margin from the page edges.

| Property | Value |
|---|---|
| Container padding | `8px 14px 0` (outer), `18px 20px 22px` (inner) |
| Border radius | `32px` |
| Background | `linear-gradient(170deg, #1e3fb0 0%, #2a4fd8 60%, #3a64ee 100%)` |
| Text color | `#fff` |
| Box shadow | `0 18px 40px rgba(30,63,176,0.28), 0 1px 0 rgba(255,255,255,0.18) inset` |

**Decorative orbits (top-right):** an inline SVG (`320 × 320`, positioned `right: -90px; top: -90px; opacity: 0.18`) with three concentric white circles (radii 70 / 105 / 140, stroke 1) and two small filled dots — `#f6b545` at (240,100) r=6 and `#7af0b6` at (80,220) r=4.

**Top row** (flex, space-between):
- **Location chip** (left) — `padding: 5px 11px`, `border-radius: 999px`, `background: rgba(0,0,0,0.18)`, `border: 0.5px solid rgba(255,255,255,0.18)`, `font-size: 10.5px`, `font-weight: 700`, `letter-spacing: 0.5px`. Contains a 5×5 green dot (`#7af0b6`) + text `BINTARO · TANGSEL`.
- **Lang + avatar** (right, gap 8):
  - Lang pill `ID · EN` — same chip styling, opacity-45 on the inactive `EN`
  - Avatar — `32 × 32` circle, `linear-gradient(135deg,#f6b545,#e26a4f)`, `border: 2px solid rgba(255,255,255,0.4)`, initial letter centered (`font-weight: 800`, `color: #3a2304`)

**Wordmark** (margin-top 22px):
- Kicker — `font-size: 13px`, `opacity: 0.78`, `font-weight: 600`, `letter-spacing: 0.6px`, `text-transform: uppercase`, text: `The directory for kids in`
- Big word — Fraunces, `font-size: 52px`, `line-height: 0.95`, `font-weight: 600`, `letter-spacing: -2px`, text: `Tangsel.` with the period in `#f6b545`
- Italic word below — Fraunces italic, `font-size: 22px`, `line-height: 1`, `opacity: 0.85`, `margin-top: 2px`, text: `Kids`

**Tagline:** `margin: 14px 0 0`, `font-size: 13.5px`, `opacity: 0.82`, `line-height: 1.45`, `max-width: 280px`. Text: `Sekolah, daycare & tempat main terbaik di Bintaro & sekitarnya — kurasi orang tua.`

**Search bar** (inside hero, margin-top 18px):
- Container: `background: #fff`, `border-radius: 18px`, `padding: 6px 6px 6px 14px`, flex/center, gap 10
- Shadow: `0 8px 18px rgba(0,0,0,0.18)`
- Search icon (18px) in `#1e3fb0`
- Placeholder text — `font-size: 14px`, `color: #64748b`, text: `Cari sekolah, area…`
- "Cari" button — `background: #0f172a`, `color: #fff`, `padding: 9px 14px`, `border-radius: 12px`, `font-weight: 700`, `font-size: 12.5px`

**Counter row** (margin-top 16px, flex gap 18):
Three stat pairs: `9 Sekolah`, `6 Centers`, `4 Playground`. Number is Fraunces 20px / weight 600 / color `#f6b545`; label is 12px with `opacity: 0.78`, baseline-aligned.

---

### 2. Section: Kategori

**Section head pattern** (reused throughout):
- Outer padding `24px 18px 0`
- Kicker — `font-size: 11px`, `font-weight: 700`, `letter-spacing: 1.5px`, `color: #1e3fb0`, `text-transform: uppercase`. Text: `01 — Kategori`
- Title row — flex baseline space-between, margin-top 4px
  - h2: Fraunces 28 / weight 600 / letter-spacing -0.6 / line-height 1.05. Text: `Kamu cari apa?`
  - Right link: 12px / weight 600 / `#64748b`. Text: `9 kategori`

**Category rows** (margin-top 14px, two stacked, gap 10):

Each row — `border-radius: 22px`, `padding: 16px`, flex/center gap 14, `color: #fff`, `box-shadow: 0 12px 28px rgba(15,23,42,0.12), 0 1px 0 rgba(255,255,255,0.18) inset`. A 4 px accent strip runs along the right edge.

Row 1 — Sekolah:
- Background: `linear-gradient(135deg,#1e3fb0,#3a64ee)`
- Right strip: `#f6b545`
- Icon tile 52×52, radius 16, `background: rgba(255,255,255,0.14)`, `border: 1px solid rgba(255,255,255,0.22)` — graduation cap icon
- Title (Fraunces 20 / 600 / -0.2): `Sekolah`
- Count label (11 / 700 / `#f6b545` / uppercase): `9 tempat`
- Sub (12 / opacity 0.78): `TK · SD · SMP · SMA — filter kurikulum & area`
- Trailing 32×32 white circle button with arrow icon in row's main color

Row 2 — Learning Centers: same anatomy, background `linear-gradient(135deg,#2a7d62,#1f9b6a)`, accent `#7af0b6`, count `6 tempat`, sub `English · Math · Art · Music · Coding`, book icon.

**Tile grid:** A `PaperTile` component, three rows (margin-top 12 / 10 / 10):

PaperTile shared spec:
- `border-radius: 20px`, `padding: 12px` (or 14 for `big`), aspect-ratio `1/1` (or `1.4/1` for `big`)
- `background`: tint color (per tile, see below)
- `border: 1px solid <accentColor>33` (33 = ~20% alpha)
- Shadow: `0 1px 0 rgba(255,255,255,0.6) inset, 0 6px 14px rgba(15,23,42,0.06)`
- Inner: top row holds a 30×30 (or 36×36 big) white rounded square with a 1 px border in `<accent>55`, containing the emoji. Bottom holds the label (Fraunces 13 / 700, big = 16) and an optional sub (11 / 600 / `#64748b`).
- "Lainnya" tile gets a 26×26 white circle "+" badge in the top-right.

| Row | Columns | Tiles |
|---|---|---|
| 1 | `1.3fr 1fr` | **Daycare** (big, sub `3 pilihan`, 🧸, tint `#fde2c8`, accent `#f6b545`) · **Taman Bermain** (sub `4 pilihan`, 🌳, tint `#d4ead7`, accent `#1f9b6a`) |
| 2 | `1fr 1fr 1fr` | **Klinik** (🩺, `#fbe1ea` / `#e26a8a`) · **Kafe Anak** (🍩, `#fde9c8` / `#eea024`) · **Mini Zoo** (🦒, `#e6dffd` / `#9d80ff`) |
| 3 | `1fr 1fr 1fr` | **Kolam** (🏊, `#d6eef2` / `#49c4d2`) · **Toko Buku** (📚, `#f3dccb` / `#c47a14`) · **Lainnya** (sub `+ 12`, ✦, `#e8eaef` / `#94a3b8`, plus badge) |

Replace emojis with real iconography from your icon set when available — emojis are placeholders.

---

### 3. CTA: Daftarkan tempat

Outer padding `24px 18px 0`. Card spec:
- `border-radius: 28px`, `padding: 20px`, `background: #0e1d4f`, `color: #fff`
- Shadow: `0 12px 30px rgba(14,29,79,0.25)`
- Decorative amber glow (absolute, 220×220 circle bottom-right, `radial-gradient(circle, rgba(246,181,69,0.35), transparent 70%)`, `right: -40px; bottom: -40px`)
- Kicker (11 / 700 / 1.2 letter / `#f6b545` / uppercase): `For owners`
- Headline (Fraunces 26 / 600 / -0.4 / `max-width: 240px`): `Punya tempat anak?` followed by italic-500 `Daftarkan.` in `#f6b545`
- Body (12.5 / opacity 0.7 / line-height 1.45 / `max-width: 260px`, margin-top 8): `Sekolah, daycare, atau tempat bermain — bantu orang tua di Tangsel menemukan tempatmu.`
- Button — `background: #f6b545`, `color: #3a2304`, `padding: 11px 16px`, `border-radius: 14px`, `font-weight: 700`, `font-size: 13px`, inline-flex gap 6 + arrow icon. Text: `Daftarkan sekarang`

---

### 4. Section: Tempat Unggulan

Section head: kicker `02 — Editor's pick`, title `Tempat Unggulan`, link `Lihat semua →`. Outer padding starts at `32px 0 0`; head padding `0 22px`; list padding `14px 18px 0` with column gap 14.

**ListingEditorial card:**
- `border-radius: 26px`, `background: #fff`, `border: 1px solid rgba(15,23,42,0.08)`, `overflow: hidden`
- Shadow: `0 1px 0 rgba(15,23,42,0.03), 0 18px 30px rgba(15,23,42,0.06)`

Top media block (`height: 130px`, gradient bg per card):
- Giant number watermark — Fraunces 180 / weight 600 / `color: rgba(255,255,255,0.18)` / `line-height: 1` / `letter-spacing: -8px`, absolute `left: -10px; top: -30px`. Shows `01`, `02`, `03`.
- Big emoji — `font-size: 64px`, absolute `right: 16px; bottom: 8px`, drop-shadow `0 4px 8px rgba(0,0,0,0.25)`
- Tag pill (top-right) — white background, `padding: 5px 9px`, `border-radius: 999px`, `font-size: 10px`, `font-weight: 800`, `letter-spacing: 0.8px`, color = card's tagColor
- Location pill (top-left) — `background: rgba(0,0,0,0.25)` with `backdrop-filter: blur(6px)`, white text, pin icon + area name, `font-size: 10.5px`, `font-weight: 700`

Body (`padding: 14px 16px 16px`):
- Kicker (11 / 700 / 0.6 letter / `#64748b` / uppercase) — category description
- Title (Fraunces 22 / 600 / -0.4 / line-height 1.1 / margin-top 3)
- Bottom row (margin-top 12, flex space-between):
  - Left: ★ in `#f6b545` + rating + `· N ulasan` in muted
  - Right: price pill — `background: #eef4ff`, `color: #1e3fb0`, `padding: 6px 12px`, `border-radius: 999px`, `font-weight: 800`, `font-size: 13px`, `Rp <price>` + small `/<unit>` in muted

The three listings:

| # | Area | Tag | Tag color | Title | Kicker | ★ / reviews | Price | Bg gradient | Emoji |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Bintaro Sektor 7 | `TOP RATED` | `#1e3fb0` | Little Stars Montessori | Sekolah · Pre-school | 4.9 / 47 | `Rp 2.5jt /bln` | `#5b86fb → #1e3fb0` (135deg) | 🎒 |
| 02 | Bintaro Sektor 5 | `MOST LOVED` | `#1f9b6a` | Happy Tots Daycare | Daycare · 1–5 thn | 4.7 / 28 | `Rp 1.5jt /bln` | `#7af0b6 → #1f9b6a` | 🧸 |
| 03 | Pondok Jaya | `POPULAR` | `#c47a14` | Spark English Center | Learning · English | 4.8 / 35 | `Rp 400k /bln` | `#ffb37a → #e26a4f` | ✏️ |

Replace gradient/emoji placeholders with real listing photos when available — drop the watermark number when there's a photo.

---

### 5. Aktifkan lokasi card

Padding `24px 18px 0`. Card:
- `border-radius: 24px`, `padding: 16px`, `background: #fff`, `border: 1px solid rgba(15,23,42,0.08)`
- Shadow: `0 1px 0 rgba(15,23,42,0.04), 0 12px 24px rgba(15,23,42,0.05)`
- Layout: flex/center gap 14
- Icon — 56×56, radius 18, `background: linear-gradient(135deg,#dbe7ff,#b9ceff)`, `border: 1px solid rgba(30,63,176,0.12)`, color `#1e3fb0`, pin icon
- Text block — kicker `Aktifkan lokasi` (11 / 700 / 0.4 letter / `#64748b` / uppercase) and title `Cari di sekitarmu` (Fraunces 15 / 700)
- Button — `background: #0f172a`, `color: #fff`, `padding: 11px 14px`, `border-radius: 14px`, `font-size: 12.5px`, `font-weight: 700`. Text: `Aktifkan`

---

### 6. Footer wordmark

Padding `32px 22px 12px`. Centered text:
- `color: #94a3b8`, `font-size: 11px`, `letter-spacing: 1.5px`, `text-transform: uppercase`, `font-weight: 700`
- Text: `✦ TangselKids · 2026 ✦`

---

### 7. Floating bottom tab bar

Fixed/absolute, `left: 14px; right: 14px; bottom: 14px; z-index: 30`. Use safe-area
insets in production: `bottom: max(14px, env(safe-area-inset-bottom))`.

- `border-radius: 28px`, `padding: 6px`, `background: #fff`
- `border: 1px solid rgba(15,23,42,0.08)`
- Shadow: `0 18px 40px rgba(15,23,42,0.12), 0 1px 0 rgba(15,23,42,0.04)`
- Layout: `display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px`

Each item — column flex, gap 3, `padding: 10px 4px`, `border-radius: 22px`, `font-size: 10.5px`, `font-weight: 700`, icon size 20px.

| Key | Label | Icon | Active |
|---|---|---|---|
| home | Beranda | home | ✓ |
| search | Jelajah | magnifier | |
| heart | Tersimpan | bookmark | |
| me | Profil | user | |

Active item: `background: #0f172a`, `color: #fff`. Inactive: transparent bg, `color: #64748b`.

---

## Interactions & Behavior

- **Tap targets:** every interactive element ≥ 44×44 px hit area.
- **Tab bar:** clicking a tab routes to that tab's screen. Persist active tab in URL.
- **Search bar in hero:** tap anywhere → focuses input → keyboard slides up. The "Cari" button submits.
- **Location pill (top-left in hero):** opens a location/area picker.
- **Lang pill (`ID · EN`):** toggles app language (i18n).
- **Avatar:** routes to profile.
- **Category rows + tiles:** route to filtered listing screen for that category.
- **"Daftarkan sekarang" button:** routes to owner-onboarding flow.
- **Listing cards:** route to listing detail. Tag pill is decorative (no separate target).
- **"Lihat semua →":** routes to full listings index.
- **"Aktifkan lokasi" button:** triggers `navigator.geolocation.getCurrentPosition`, then re-renders nearby section.

### Animations
Keep restrained. Suggested set:
- Cards: `transition: transform 150ms ease, box-shadow 150ms ease`. On `:active`, `transform: scale(0.98)`.
- Tab bar: active background slides under the tapped item with `transition: 200ms cubic-bezier(0.2, 0.8, 0.2, 1)` (use a single moving pill or animate background-position).
- Page mount: subtle fade-in (`opacity 0 → 1` over 200ms) only — no hero parallax, no scroll-triggered.

### Loading & error states
- Listings: skeleton cards with the same dimensions, `background: linear-gradient(90deg, #ece7df 0%, #f3efe8 50%, #ece7df 100%)`, animated 1.4s shimmer.
- Empty state ("no results"): centered illustration placeholder, headline `Belum ada hasil`, sub `Coba kategori lain atau ubah area.`
- Geolocation error: inline replacement of the lokasi card with a red-bordered variant (`border-color: #e26a8a`) and copy `Tidak bisa mengakses lokasi. Pilih area secara manual.`

### Responsive behavior
The design is mobile-first. Above 480 px, cap inner content at `max-width: 440px` and center. The hero stays full-bleed inside that frame.

---

## State Management

Minimal — most data is fetched, not local. State to keep:

```ts
type HomeState = {
  language: 'id' | 'en';
  area: string;                  // e.g. 'BINTARO · TANGSEL'
  geolocation: { lat: number; lng: number } | null;
  geolocationStatus: 'idle' | 'requesting' | 'granted' | 'denied';
  searchQuery: string;
  // Server-driven:
  categoryCounts: Record<string, number>;
  featured: Listing[];           // for "Tempat Unggulan"
};
```

Data fetching: featured listings, category counts, and (if geolocation granted) nearby listings. Use the project's existing data layer (React Query / SWR / fetch wrapper).

---

## Design Tokens

Add these to your tokens file (or Tailwind config). They're a strict superset of the current palette — nothing was invented from scratch beyond the warm paper neutrals.

### Colors

```css
/* Brand blue */
--tk-blue-50:  #eef4ff;
--tk-blue-100: #dbe7ff;
--tk-blue-200: #b9ceff;
--tk-blue-300: #8aacff;
--tk-blue-400: #5b86fb;
--tk-blue-500: #3a64ee;
--tk-blue-600: #2a4fd8;
--tk-blue-700: #1e3fb0;   /* primary */
--tk-blue-800: #1a3592;
--tk-blue-900: #172b73;
--tk-blue-950: #0e1d4f;   /* hero CTA bg */

/* Accents */
--tk-amber-400: #f6b545;  /* primary accent */
--tk-amber-500: #eea024;
--tk-amber-700: #c47a14;
--tk-rose-500:  #e26a8a;
--tk-emerald-500: #1f9b6a;
--tk-teal-400:  #49c4d2;
--tk-violet-400: #9d80ff;
--tk-mint-300:  #7af0b6;

/* Neutrals */
--tk-ink:    #0f172a;     /* primary text + dark buttons */
--tk-ink-2:  #1e293b;
--tk-muted:  #64748b;
--tk-muted-2:#94a3b8;
--tk-line:   rgba(15,23,42,0.08);

/* Surfaces */
--tk-paper:    #ffffff;
--tk-paper-bg: #f3efe8;   /* page background */
--tk-paper-warm-1: #f6f1e8;
--tk-paper-warm-2: #efeae0;

/* Tile tints */
--tile-tint-amber: #fde2c8;
--tile-tint-mint:  #d4ead7;
--tile-tint-rose:  #fbe1ea;
--tile-tint-yolk:  #fde9c8;
--tile-tint-violet:#e6dffd;
--tile-tint-teal:  #d6eef2;
--tile-tint-clay:  #f3dccb;
--tile-tint-slate: #e8eaef;
```

### Typography

Two families. Load both via Google Fonts (or self-host).

| Token | Family | Use |
|---|---|---|
| `--tk-font` | Plus Jakarta Sans, weights 400/500/600/700/800 | Body, UI, labels |
| `--tk-font-display` | Fraunces (variable, opsz 9..144), weights 400/500/600/700, italic 400/500 | All headings, big numbers, brand wordmark |

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..500&display=swap" rel="stylesheet">
```

Type scale (used in this design — not exhaustive):

| Role | Family | Size | Weight | Letter | Line-height |
|---|---|---|---|---|---|
| Hero word | Display | 52 | 600 | -2 | 0.95 |
| H2 (Fraunces) | Display | 28 | 600 | -0.6 | 1.05 |
| Card title | Display | 22 | 600 | -0.4 | 1.1 |
| Category title | Display | 20 | 600 | -0.2 | 1.2 |
| Body | Body | 14 | 400 | 0 | 1.45 |
| Label | Body | 12.5 | 600 | 0.2 | 1.4 |
| Kicker | Body | 11 | 700 | 1.5 | 1.2, uppercase |
| Tag pill | Body | 10 | 800 | 0.8 | 1, uppercase |

### Spacing
Use a 4 px base scale: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32. The design's outer page gutter is **18 px** with the hero at **14 px**.

### Border radius
- Tiles & small cards: **20 px**
- Default cards / category rows / search container: **22 px**
- Inset list cards / lokasi card: **24 px**
- Listing cards & sticker CTA: **26–28 px**
- Hero panel: **32 px**
- Pills, dots, tab-active backgrounds: **999 px**

### Shadows
```css
--shadow-card:    0 1px 0 rgba(15,23,42,0.03), 0 18px 30px rgba(15,23,42,0.06);
--shadow-tile:    0 1px 0 rgba(255,255,255,0.6) inset, 0 6px 14px rgba(15,23,42,0.06);
--shadow-hero:    0 18px 40px rgba(30,63,176,0.28), 0 1px 0 rgba(255,255,255,0.18) inset;
--shadow-cta:     0 12px 30px rgba(14,29,79,0.25);
--shadow-tabbar:  0 18px 40px rgba(15,23,42,0.12), 0 1px 0 rgba(15,23,42,0.04);
--shadow-cat:     0 12px 28px rgba(15,23,42,0.12), 0 1px 0 rgba(255,255,255,0.18) inset;
```

---

## Assets

- **Fonts:** Plus Jakarta Sans + Fraunces from Google Fonts.
- **Icons:** the prototype uses inline SVGs (search, sliders, check, cap, book, star, pin, cog, arrow, home, heart, user, bookmark, spark). Replace with your icon library — **Lucide** is a great match for the line weight (1.8 px stroke). Specific glyph names: `search`, `sliders-horizontal`, `check`, `graduation-cap`, `book-open`, `star`, `map-pin`, `settings`, `arrow-right`, `home`, `heart`, `user`, `bookmark`, `sparkles`.
- **Imagery:** the listing media blocks are placeholder gradients + emojis. In production, swap to real photos with the same crop ratio (full-bleed top of card, height 130 px, no padding). Drop the giant Fraunces watermark number when a real photo is in place.
- **Decorative SVGs:** the hero "orbits" SVG is hand-authored and lives in the prototype (`variation-b-editorial.jsx`). Lift verbatim or rebuild.

---

## Files

In this handoff folder:

- `TangselKids Home.html` — the canvas with both variations side-by-side. Open in a browser to see.
- `variation-b-editorial.jsx` — **the source of truth**. Pixel-accurate React/JSX of the chosen direction. Read this when in doubt — every value in the README came from here.
- `tokens.css` — the design tokens as CSS variables.
- `variation-a-glass.jsx` — alternate "Liquid Glass" exploration (not chosen). Reference only.
- `_current-design.jpg` — screenshot of the existing home for before/after comparison.
- `design-canvas.jsx`, `ios-frame.jsx` — scaffolding used by the prototype HTML; not part of the production design.

---

## Implementation checklist

1. Install / load Plus Jakarta Sans + Fraunces.
2. Add tokens to your design system (colors, radii, shadows, type scale).
3. Build leaf components: `SectionHead`, `CategoryRow`, `PaperTile`, `ListingCard`, `StickerCTA`, `LocationCard`, `TabBar`.
4. Compose the home page in the order listed under **Screen: Home**.
5. Wire data: featured listings, category counts, geolocation request.
6. Wire navigation: tab bar, category tap, listing tap, owner CTA.
7. Add skeleton loading + error states per **Loading & error states**.
8. Test at 360 / 390 / 414 / 480 widths and tablet (centered, max-width 440).

If anything is ambiguous, the prototype HTML is authoritative — open it next to your dev server and match.
