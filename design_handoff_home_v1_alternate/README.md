# Handoff: TangselKids — Alternate Home (V1 "Polished Editorial")

## Overview

This is a design handoff for an **alternate home screen** for the TangselKids mobile app — a curated directory of kid-friendly places (schools, daycares, courses, playgrounds, etc.) in Tangsel / Bintaro, Indonesia.

> ⚠️ **This is an additional home variant, not a replacement.** Ship it alongside the existing home screen — e.g. behind a feature flag, A/B test arm, or a user-facing toggle. The current home should remain the default until product decides otherwise.

The design takes an **editorial / cut-paper magazine** direction: tall serif masthead, polaroid-style kid portraits with paper tape, scattered confetti, square photo-driven feature cards for the two priority categories ("Sekolah" and "Tempat Kursus"), and a numbered indeks list for the rest.

## About the Design Files

The files in this bundle are **design references created in HTML** — a working React + Babel prototype showing intended look and behavior. They are **not** production code to copy directly.

Your task is to **recreate this design in TangselKids' existing app codebase** using its established framework, design system, navigation, and data layer. If TangselKids does not yet have a frontend codebase, pick the framework that best fits the team and the rest of the product (React Native is the natural choice for a mobile app like this) and implement there.

## Fidelity

**High-fidelity (hifi).** Pixel-level intent for colors, typography, spacing, photography, and micro-interactions is encoded in the prototype. Recreate pixel-perfectly using the codebase's existing components and patterns where possible; replace the prototype's inline styles with the app's styling solution (StyleSheet, Tamagui, NativeWind, styled-components, etc.).

## Target device

iOS / Android phones. Design canvas: **390 × 844** (iPhone 14/15 logical px). Layout should adapt fluidly down to ~360 wide and up to ~430 wide. The top safe-area inset is accounted for via `padding-top: 50–54px` in the masthead — replace with the platform's actual safe-area inset.

---

## Screens / Views

There are **4 tab screens**. Only the **Home (Beranda)** tab is fully designed; the other three (Jelajah, Tersimpan, Profil) are stubs with editorial placeholder copy and out of scope for this handoff (build them as empty states or wire them to existing screens).

### Home (Beranda) — scrollable, vertical

Top to bottom:

1. **Sticky mini-masthead** (appears after ~140px scroll)
   - Translucent paper background `rgba(246,241,232,0.92)` + 14px backdrop blur
   - Bottom border `1px solid rgba(15,23,42,0.1)`
   - Left: `Tangsel.Kids` wordmark — Fraunces 22px, 700, letter-spacing -1, dot in accent color, "Kids" italic 14px 70% opacity, 4px gap
   - Right: location pill `📍 BINTARO` — `#0e1d4f` bg, white text, 10.5px / 700, 5×9px padding, 8px radius

2. **Masthead** (54px top padding, 22px sides)
   - **Eyebrow row**: `EDISI · MINGGU 18 — MEI 2026` (10px / 800, letter-spacing 1.2, `#94a3b8`) on the left; **avatar pill** on the right (32×32 circle, `#0e1d4f` bg, white "R" 12px / 700)
   - **Confetti SVG** absolutely positioned behind, 40px from top, 170px tall — scattered shapes (yellow circle, green rotated square, rose diamond, blue dot, amber wavy line, violet diamond, yellow star). Fades on scroll: `opacity = max(0, 1 - scrollY*0.01)`
   - **Wordmark + polaroid stack** in a row, bottom-aligned:
     - Left: `Tangsel.` Fraunces 60px / 700, letter-spacing -2.2, line-height 0.92, color `#0e1d4f`, with the dot in accent color. Below it: `Kids — Bintaro` Fraunces italic 24px / 500, 70% opacity, marginTop -2px
     - Right: **stacked polaroids** (see component spec below)
   - **Editor's note** below, separated by `1px solid rgba(15,23,42,0.18)` top border, 14px padding-top, 16px margin-top:
     - Italic 12.5px `#475569`, line-height 1.5
     - "Dari redaksi." in non-italic 700 `#0e1d4f`
     - Animated counter "57" tempat — counts up from 0 over 1100ms, ease-out cubic
     - Full text: `Dari redaksi. **57** tempat terkurasi — sekolah, daycare, taman bermain. Pilih dengan tenang.`

3. **Search bar** (14px top padding)
   - White card, 14px radius, 12×14px padding, `1px solid rgba(15,23,42,0.12)`
   - Focused state: border `rgba(14,29,79,0.55)`, shadow `0 6px 20px rgba(14,29,79,0.12)`
   - Magnifier glyph (`⌕` `#94a3b8` 14px), then text input (13px `#0e1d4f`, placeholder `Cari sekolah, area…`), then **area pill** (`📍 BINTARO`, `#0e1d4f` bg, white 10.5px / 700, 6×10 padding, 8px radius)
   - **Live suggestions dropdown** when focused with non-empty input — white card 12px radius, 18px / 40 shadow, max 4 matches; each row: 8.5px / 800 tag (e.g. `SEKOLAH`) in accent on left (60px wide), name 12.5px / 600 + area 10.5px `#94a3b8` in middle, chevron right
   - Suggestion data: `[{tag, name, area}]` filterable on name + area

4. **Feature pair "FITUR UTAMA · KAMU CARI APA?"** (28px top padding)
   - Eyebrow on the left, "Lihat semua →" link on the right (10px / 700, accent)
   - 2-column grid, 12px gap
   - Each card: aspect-ratio 1/1.05, 6px radius, photo background, tone overlay (multiply blend), bottom darken gradient, 14px padding, white text
     - **Sekolah**: photo `school.jpg`, tone `linear-gradient(165deg, rgba(58,100,238,0.85), rgba(30,63,176,0.92))`, accent `#f6b545`, count 9, sub `TK · SD · SMP · SMA — kurikulum nasional, internasional & alam.`
     - **Tempat Kursus**: photo `kursus.jpg`, tone `linear-gradient(165deg, rgba(42,125,98,0.85), rgba(31,155,106,0.92))`, accent `#7af0b6`, count 6, sub `English · Math · Art · Music · Coding — kelas privat & grup.`
   - Layout inside each card:
     - Top row: `NO. 01` (9.5px / 800) on left, `★ FITUR` glass pill on right (rgba(255,255,255,0.18) bg + 8px backdrop blur, accent text 9px / 700)
     - Bottom block: title (Fraunces 26px / 700, letter-spacing -0.5), sub (10.5px, 92% opacity, line-height 1.35), divider `1px solid rgba(255,255,255,0.28)` 10px padding-top, then count (Fraunces 22px / 700 in accent) + chevron in `#fff7ec` 28px circle
   - **Tap behavior**: tap a card → expand a **peek-sheet** below the grid (12px margin-top, 200px max-height, 0.4s ease). Tap again to collapse. Tapping the other card swaps which one is expanded
   - **Peek-sheet content**: white card, 12px radius, 14×16 padding; eyebrow `FILTER CEPAT — SEKOLAH` / `…— KURSUS`; flex-wrap chips (11px / 600, `#0e1d4f` text on `#f6f1e8` bg, 999 radius, 6×10 padding, hairline border)
     - Sekolah chips: TK, SD, SMP, SMA, Internasional, Sekolah Alam, Bintaro 7, Bintaro 9, BSD
     - Kursus chips: English, Mandarin, Math, Art, Music, Coding, Robotik, Privat, Grup

5. **Indeks list "INDEKS — KATEGORI LAIN"** (28px top padding)
   - Eyebrow, then 1px top border, then rows of 11px vertical padding separated by `1px solid rgba(15,23,42,0.08)`
   - Each row: number (Fraunces 13px / 700 accent, 22px wide, tabular-nums), name (Fraunces 17px / 600 `#0e1d4f`, letter-spacing -0.2), count (10.5px / 600 `#94a3b8`), chevron right
   - Items: `03 Daycares · 11 tempat`, `04 Playgrounds · 8 tempat`, `05 Klinik Tumbuh Kembang · 4 tempat`, `06 Kafe Ramah Anak · 7 tempat`, `07 Bermain Dengan Binatang · 3 tempat`, `08 Kolam Renang & Waterparks · 5 tempat`, `09 Toko Buku & Alat Tulis · 2 tempat`, `— Lainnya · + 4 kategori`

6. **Cover Story "COVER STORY · TEMPAT UNGGULAN"** (28px top padding)
   - White card, 6px radius, hairline border
   - Photo region: aspect 4/3, photo full-bleed, gradient overlay `linear-gradient(180deg, rgba(14,29,79,0.05) 30%, rgba(14,29,79,0.75) 100%)`
   - Top-left badge: `★ EDITOR'S PICK NO. 01` — `#0e1d4f` bg, `#f6f1e8` text, 9.5px / 800, 4×9 padding
   - Top-right **save toggle**: 34×34 white circle (95% opacity), `0 6/14` shadow, heart icon (filled rose `#e26a6a` when saved). Spring pop on toggle: scale(1.18) for 250ms, cubic-bezier(.5,1.6,.4,1)
   - Bottom-left title: Fraunces 30px / 700, letter-spacing -0.6, white, max 240px, text-shadow `0 2px 12px rgba(0,0,0,0.4)`. Content: "Little Stars Montessori"
   - Bottom-right location: 10.5px / 600 white 95%, "📍 Bintaro Sektor 7"
   - Body: 14×16 padding, italic 12.5px `#475569` quote, then meta row: `★ 4.9 · 47 ulasan` (left), `Rp 2.5jt /bln` (right, 700 `#0e1d4f`)

7. **Articles "BERITA & ARTIKEL"** (28px top padding)
   - 3 rows, each: 14px vertical padding, hairline divider, 12px gap
   - Left text block: tag (9.5px / 800 accent), title (Fraunces 16px / 700 letter-spacing -0.2), meta (11px `#94a3b8`)
   - Right thumbnail: 72×72, 4px radius, hairline border
   - Items:
     - `PARENTING · 5 Cara Mengajarkan Anak Mengelola Emosi · 3 Apr · 4 menit`
     - `SEKOLAH · Sekolah Terbaik di Bintaro: Panduan Lengkap 2026 · 20 Apr · 7 menit`
     - `AKTIVITAS · Aktivitas Seru Akhir Pekan Bersama Anak di Tangsel · 15 Apr · 5 menit`

8. **CTA "UNTUK PEMILIK TEMPAT"** (24px top padding)
   - Hairline-bordered card, 4px radius, 18px padding, row layout
   - Left: eyebrow + Fraunces 18px / 700 "Daftarkan tempatmu."
   - Right: `Daftar →` button — `#0e1d4f` bg, white, 12px / 700, 10×14 padding, 4px radius

9. **Footer mark**: centered `TANGSELKIDS · EDISI MEI 2026` (9.5px / 700, letter-spacing 1, `#94a3b8`), 20px top padding

10. **Tab bar (fixed bottom)**
    - 14px from edges, 14px from bottom, white card 28px radius, 6px padding, hairline border, `0 18/40` shadow
    - 4 equal-flex items: `⌂ Beranda` `⌕ Jelajah` `♥ Tersimpan` `◯ Profil`
    - Active item: `#0e1d4f` filled pill 22px radius, white text. Inactive: transparent bg, `#64748b` text. Both: 11px / 700, icon 14px on top with 3px margin
    - Press: scale 0.94 for 140ms

---

## Component Specs

### Polaroid stack (KidPolaroids)

Two stacked photo cards behind the wordmark. 130×140 wrapper, polaroids overlap.

- **Front polaroid** (left, top:0): 84×102, `#fff7ec` bg, 5px padding 14px bottom-padding, hairline border, `0 12/22` shadow, rotate(tilt) where `tilt = max(-10, -4 - scrollY*0.04)` (parallax with scroll). Photo 76px tall, full width, object-cover, slight saturation/contrast bump. Caption at bottom: Fraunces italic 10px `#0e1d4f` "Aira · 4". **Yellow tape**: absolutely positioned across top, 25–75% width, 14px tall, `#f6b545` 85% opacity, rotate(-6deg)
- **Back polaroid** (right, top:12): 78×96, similar but no tape, rotate(6 - tilt*0.2). Photo "Bumi · 6", saturation 0.95

### Pressable wrapper

Every tappable element uses a press-scale wrapper:
- Default scale 0.97 (cards), 0.94 (chips/pills/buttons), 0.92 (small icon buttons), 0.85 (heart toggle), 0.99 (list rows)
- Transition `transform .14s cubic-bezier(.2,.7,.3,1)`
- On pointerdown apply scale, pointerup/pointerleave restore

### Animated counter

Counts from 0 to target over 1100ms with cubic ease-out (`1 - (1-t)^3`). Uses requestAnimationFrame.

---

## Interactions & Behavior

| Trigger | Effect |
|---|---|
| Scroll past 140px | Sticky mini-masthead slides down (transform translateY 0, opacity 1, 300ms) |
| Scroll | Front polaroid tilt animates (parallax), confetti fades |
| Focus search input | Border darkens, shadow appears, dropdown shows if query non-empty |
| Type in search | Filter SUGGESTIONS by name + area, show top 4 |
| Blur search | 180ms delay then hide dropdown (lets click on suggestion register) |
| Tap feature card | Toggle expand peek-sheet (max-height 0→200px, opacity 0→1, photo scale 1→1.08), chevron rotates 90° |
| Tap other feature card while one expanded | Switch which is expanded |
| Tap heart on cover | Toggle saved state, spring scale pop (250ms cubic-bezier(.5,1.6,.4,1)), filled rose when saved |
| Tap tab | Switch active tab, content swaps |
| Mount | Full stage fades in (translateY 6→0, opacity 0→1, 500ms), counter animates |

---

## State Management

| State | Owner | Type | Initial |
|---|---|---|---|
| `tab` | HomeV1Polished | `'home' \| 'search' \| 'save' \| 'user'` | `'home'` |
| `scrollY` | HomeV1Polished | number | 0 |
| `expandedFeature` | FeaturePair | `'sekolah' \| 'kursus' \| null` | null |
| `searchQuery` | SearchBar | string | `''` |
| `searchFocused` | SearchBar | boolean | false |
| `saved` (cover) | CoverStory | boolean | false |

In production, `saved` should persist (per-user, per-place) via your data layer.

---

## Data Requirements

The prototype uses static data; in production wire these to your API:

- **Featured categories** (Sekolah, Kursus): `{ slug, title, count, sub, photoUrl, tone, accent }` — content team curates
- **Other categories indeks**: `{ number, name, count, slug }`
- **Cover story**: `{ id, name, area, photoUrl, quote, rating, reviewCount, priceLabel, badge }` — editor's pick of the week
- **Search suggestions**: `{ tag, name, area, slug }` — backed by full place + category index
- **Articles**: `{ tag, title, meta, photoUrl, slug }` — CMS

---

## Design Tokens

Reuse the existing `tokens.css` variables. The full set is in this bundle. The key ones used here:

```css
--tk-blue-400: #5b86fb;
--tk-blue-500: #3a64ee;
--tk-blue-700: #1e3fb0;
--tk-blue-950: #0e1d4f;   /* primary ink, button bg */
--tk-amber-400: #f6b545;  /* tape, sekolah accent on dark */
--tk-rose-500:  #e26a6a;  /* heart, confetti */
--tk-emerald-500: #1f9b6a;/* kursus tone */
--tk-bg-warm:  #f3efe8;   /* paper background (note: prototype uses #f6f1e8) */
--tk-paper:    #ffffff;
--tk-muted:  #64748b;     /* secondary text */
--tk-muted-2:#94a3b8;     /* tertiary / eyebrow text */

/* prototype-introduced */
--tk-accent: #c47a14;     /* the editorial mustard accent (Tangsel "."), tweakable */
```

**Spacing scale (used consistently):** 4, 6, 8, 10, 11, 12, 14, 16, 18, 22, 24, 28 px.

**Radius scale:** 4 (CTA button), 6 (cards/photos), 8 (peek-sheet, area pill), 12 (search bar variants), 14 (search bar), 22 (active tab pill), 28 (tab bar), 999 (avatar, area pill, glass pills).

**Shadows:**
- Cards: `0 12px 28px rgba(15,23,42,0.12)`
- Polaroid front: `0 12px 22px rgba(15,23,42,0.18)`
- Polaroid back: `0 8px 18px rgba(15,23,42,0.16)`
- Tab bar: `0 18px 40px rgba(15,23,42,0.12)`
- Search focused: `0 6px 20px rgba(14,29,79,0.12)`
- Heart button: `0 6px 14px rgba(0,0,0,0.18)`

**Typography:**
- Display: **Fraunces** (Google) — opsz 9..144, weights 400/500/600/700, supports italic
- UI: **Plus Jakarta Sans** (Google) — weights 400/500/600/700/800
- Both must be available offline-capable / preconnected

---

## Assets

The prototype uses **placeholder photos from Unsplash** for the cover story, polaroid kid portraits, feature cards, and article thumbnails. In production:

- **Polaroid kid portraits**: replace with real, consented photos of TangselKids community kids, OR commissioned illustration. Do **not** ship Unsplash photos of identifiable children.
- **Cover story / feature cards / articles**: use the actual place's photo (or a stock photo licensed for commercial use) supplied by the content team.

Unsplash URLs currently in the prototype (replace before launch):

| Field | Current URL (Unsplash) |
|---|---|
| Cover | `photo-1503676260728-1c00da094a0b` |
| Polaroid front (Aira) | `photo-1519457431-44ccd64a579b` |
| Polaroid back (Bumi) | `photo-1545558014-8692077e9b5c` |
| Feature: Sekolah | `photo-1580582932707-520aed937b7b` |
| Feature: Kursus | `photo-1588072432836-e10032774350` |
| Article 1 | `photo-1503454537195-1dcabb73ffb9` |
| Article 2 | `photo-1588072432904-843af37f03ed` |
| Article 3 | `photo-1596464716127-f2a82984de30` |

No custom icons are required — the prototype uses inline SVG (chevron, heart) and Unicode glyphs (`⌂ ⌕ ♥ ◯ ★ 📍 ✦`). Replace Unicode tab-bar glyphs with your icon library (e.g. lucide / Phosphor / SF Symbols equivalents) for visual consistency.

---

## Files in this bundle

| File | What it is |
|---|---|
| `TangselKids Home V1 Polished.html` | Host HTML — wires React, fonts, the iOS device frame, and the Tweaks panel |
| `home-v1-polished.jsx` | All home-screen components (Shell, Masthead, SearchBar, FeaturePair, IndexList, CoverStory, ArticleList, TabBar, etc.) — main reference |
| `tokens.css` | CSS variables — the design system tokens this design uses |
| `ios-frame.jsx` | The iOS device bezel used by the prototype (NOT for production — your app already runs on a real device) |
| `tweaks-panel.jsx` | The in-prototype tweaks UI (NOT for production) |

To run the prototype locally for reference: open `TangselKids Home V1 Polished.html` directly in a browser. The Tweaks panel in the bottom right exposes accent color (amber/rose/emerald/violet), a frame on/off toggle, and a confetti on/off toggle.

---

## Build order suggestion

1. Set up the route / screen container, gated behind a feature flag so the existing home stays default
2. Tokens — confirm the design tokens above already exist in your codebase; add `--tk-accent` if missing
3. Static skeleton — masthead, search, feature pair, indeks list, cover story, articles, CTA, tab bar, with placeholder data
4. Wire data — connect each section to your API / CMS
5. Interactions — tab switching, search w/ live suggestions, feature peek-sheet, save toggle, scroll-aware sticky header, animated counter
6. Motion polish — press scales, parallax polaroid, confetti fade, spring heart
7. QA on small devices (iPhone SE-class) — verify the polaroid stack and feature pair grid don't crowd

Done means: the new home matches the prototype pixel-for-pixel within your styling system, all interactions feel native, and it ships behind a flag without touching the existing home.
