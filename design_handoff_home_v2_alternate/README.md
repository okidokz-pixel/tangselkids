# Handoff: TangselKids — Alternate Home (V1 "Polished Editorial")

## Overview

This is a design handoff for an **alternate home screen** for the TangselKids mobile app — a curated directory of kid-friendly places (schools, courses, daycares, playgrounds, clinics, etc.) in Tangsel / Bintaro, Indonesia.

> ⚠️ **This is an additional home variant, not a replacement.** Ship it alongside the existing home screen — e.g. behind a feature flag, A/B test arm, or a user-facing toggle. The current home should remain the default until product decides otherwise.
>
> **This package replaces the previous handoff** in this same folder. The earlier polished editorial version (with confetti, polaroid kid portraits, an "Edisi · Minggu 18 — Mei 2026" eyebrow, a "Dari redaksi" note, and a search bar in the masthead) has been pared back to a tighter, more focused composition. Don't carry forward those removed pieces.

The design takes a **clean editorial / cut-paper magazine** direction: a compact masthead with a custom paper-square logo, a full-bleed animated typewriter tagline, two square photo-driven feature cards with inline area + age-range filters, an icon-driven indeks list for the rest of the categories, a cover-story card, articles, and a CTA for place owners.

## About the Design Files

The files in this bundle are **design references created in HTML** — a working React + Babel prototype showing intended look and behavior. They are **not** production code to copy directly.

Your task is to **recreate this design in TangselKids' existing app codebase** using its established framework, design system, navigation, and data layer. If TangselKids does not yet have a frontend codebase, pick the framework that best fits the team and the rest of the product (React Native is the natural choice for a mobile app like this) and implement there.

## Fidelity

**High-fidelity (hifi).** Pixel-level intent for colors, typography, spacing, photography, and micro-interactions is encoded in the prototype. Recreate pixel-perfectly using the codebase's existing components and patterns where possible; replace the prototype's inline styles with the app's styling solution (StyleSheet, Tamagui, NativeWind, styled-components, etc.).

## Target device

iOS / Android phones. Design canvas: **390 × 844** (iPhone 14/15 logical px). Layout should adapt fluidly down to ~360 wide and up to ~430 wide. The top safe-area inset is accounted for via `padding-top: 64px` in the masthead (50px sticky variant) — replace with the platform's actual safe-area inset.

---

## Screens / Views

There are **4 tab screens**. Only the **Home (Beranda)** tab is fully designed; the other three (Jelajah, Tersimpan, Profil) are stubs with editorial placeholder copy and out of scope for this handoff (build them as empty states or wire them to existing screens).

### Home (Beranda) — scrollable, vertical

Top to bottom:

1. **Sticky mini-masthead** (appears after ~140px scroll)
   - Translucent paper background `rgba(246,241,232,0.92)` + 14px backdrop blur
   - Bottom border `1px solid rgba(15,23,42,0.1)`
   - Single content element: `Tangsel.Kids` wordmark — Fraunces 22px / 700, letter-spacing -1, dot in accent color, "Kids" italic 14px / 70% opacity, 4px gap. **No location pill, no icons.**
   - Slide animation: `translateY(-100%) → 0` + opacity 0 → 1 over 300ms when `scrollY > 140`

2. **Masthead** (64px top padding, 22px sides — accounts for status-bar safe area)
   - **Top row**: 3-column flex, `justify-content: space-between`, vertical-center, 12px gap.
     - **Left**: `<Logo />` — 52×52 custom inline SVG (see component spec).
     - **Middle (flex:1)**: stacked wordmark.
       - `Tangsel.` — Fraunces 38px / 700, letter-spacing -1.4, line-height 0.95, color `#0e1d4f`. The trailing dot is in the accent color.
       - `Kids` directly below — Fraunces italic 24px / 500, color `#0e1d4f`, opacity 0.7, letter-spacing 4, marginTop -2px.
     - **Right**: column flex, 6px gap, vertical-center, no shrink.
       - **Avatar** — 26×26 circle, `#0e1d4f` bg, white "R" Plus Jakarta 11px / 700.
       - **`<LangToggle />`** below the avatar — small EN / ID segmented toggle (component already exists in the codebase or wire to a real i18n switcher).
   - **Tagline** below the top row, 14px margin-top, max-width 320px:
     - 12.5px / line-height 1.45 / `#475569`
     - Copy: `Direktori cerdas untuk orang tua di **Bintaro** dan **BSD**.`
     - "Bintaro" and "BSD" are bold 700, color `var(--tk-accent, #1f9b6a)`.

3. **Typewriter band** — full-bleed, sits directly under the masthead.
   - Background: solid `#0e1d4f` (deep blue ink), full viewport width
   - Padding: 22px horizontal, 18px vertical
   - Content: a single line of Fraunces 18px / 600 white, line-height 1.2:
     - Static prefix: `"Cari "` (white)
     - Cycling word: rendered character-by-character with a typing → pause → deleting → pause loop. Color of cycling word: `var(--tk-accent, #f6b545)` (mustard).
     - Trailing caret: a 2px-wide block `|` at the end, blinks every 500ms via opacity 1 ↔ 0.2.
   - Words to cycle through (in order, lowercase as written):
     `sekolah`, `tempat kursus`, `daycare`, `playground`, `Klinik Anak`, `kafe ramah anak`, `kolam renang`
   - Timing:
     - Typing: 70ms per character
     - Pause after fully typed: 1300ms
     - Deleting: 40ms per character
     - Pause empty before next word: 260ms
   - The band's height should be fixed (or `min-height` set to fit the longest word) so layout below doesn't jump as words swap.

4. **Feature pair "FITUR UTAMA · KAMU CARI APA?"** (28px top padding)
   - Eyebrow on the left (10px / 800 / letter-spacing 1.2 / `#94a3b8`), **"Lihat semua →"** link on the right (10px / 700, accent).
   - 2-column grid, 12px gap.
   - **Each card**:
     - Aspect-ratio **1/1.1**, 6px radius, `position: relative`, `overflow: hidden`, `box-sizing: border-box`.
     - Photo background: `position:absolute; inset:0; object-fit:cover`. Adds a `transform: scale(1)` default that animates to `scale(1.08)` over 600ms when the card is the expanded one.
     - Tone overlay: `position:absolute; inset:0; mix-blend-mode: multiply; background: <toneGradient>`.
     - Bottom darken: `position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)`.
     - **Content layer**: `position:absolute; inset:0; padding: 14px 14px 16px; box-sizing: border-box; display:flex; flex-direction:column; justify-content:flex-end; color:#fff;` — anchored to bottom.
       - Title (Fraunces 24px / 700, letter-spacing -0.5, line-height 1).
       - Sub (10.5px, opacity 0.92, marginTop 6px, line-height 1.35, max-height 28px collapsed → 60px expanded with 350ms transition).
       - Divider row: marginTop 8, paddingTop 8, `border-top: 1px solid rgba(255,255,255,0.28)`. Inside: count (Fraunces 20px / 700 in accent) followed by lowercase `tempat` 10.5px / 700 / opacity 0.95 / 4px left-margin, plus a chevron button on the right.
       - Chevron button: 26×26 circle, `#fff7ec` bg, `<Chev />` svg dark. Rotates 0° → 90° (300ms) when expanded.
   - **Card data**:
     - **Sekolah**: `idx="01"` (no longer rendered as a badge), title `Sekolah`, count `9`, sub `TK · SD · SMP · SMA — kurikulum nasional, internasional & alam.`, photo `PHOTOS.sekolah`, tone `linear-gradient(165deg, rgba(58,100,238,0.85), rgba(30,63,176,0.92))`, accent `#f6b545`.
     - **Tempat Kursus**: title `Tempat Kursus`, count `6`, sub `English · Math · Art · Music · Coding — kelas privat & grup.`, photo `PHOTOS.kursus`, tone `linear-gradient(165deg, rgba(42,125,98,0.85), rgba(31,155,106,0.92))`, accent `#7af0b6`.
   - **Tap behavior**: tap a card → expand a **peek-sheet panel below the grid** (12px margin-top, animates open). Tap again to collapse. Tapping the other card swaps which is expanded.

   > **Important:** The previous version of this design used a **glass `★ MOST POPULAR`** badge in the top-right corner of each card. This has been **removed**. Do not render it. Cards are clean: photo, tone, content stack at bottom.

5. **Peek-sheet** (only visible when a feature card is expanded; appears between the feature cards and the indeks list)
   - White card, 12px radius, hairline border, 14×16px padding, 12px margin-top.
   - Two stacked sections: **Area pills** then **Age bands**.

   **Area pills** — pick which area to filter by.
   - Eyebrow: `AREA` (9.5px / 800 / letter-spacing 1 / `#94a3b8` / margin-bottom 8px).
   - Horizontal flex, 8px gap, wrap allowed.
   - Each pill: 11×14px padding, 999 radius, white bg, `1px solid rgba(15,23,42,0.14)`.
     - Selected pill (when `area === pill.key`): bg `var(--tk-accent)`, text white, border same accent.
     - Inside: name (Fraunces 14px / 700, letter-spacing -0.2, color `#0e1d4f` or white) + a small count badge to the right (Plus Jakarta 11px / 700, color `#94a3b8` or white 80%).
   - Pills:
     - `Bintaro` — sekolah 5 / kursus 4
     - `BSD` — sekolah 4 / kursus 2
     - `Semua` — sekolah 9 / kursus 6  *(label is exactly "Semua", not "Semua Area")*

   **Age bands** — horizontally scrollable rail of pills, content depends on which feature card is expanded.
   - Eyebrow: `JENJANG SEKOLAH` for Sekolah, `UNTUK USIA BERAPA?` for Kursus (9.5px / 800 / letter-spacing 1 / `#94a3b8` / margin-bottom 8px).
   - Rail: `display:flex; gap:10px; overflow-x:auto; padding:4px 2px 8px; margin: 0 -22px; padding-left:22; padding-right:22;` (the negative margin extends the rail edge-to-edge while keeping content padded).
   - Hide native scrollbar (`scrollbar-width:none`, `::-webkit-scrollbar { display:none }`).
   - Each band card: flex-shrink 0, min-width 96px, column flex 4px gap, 11×14px padding, 12px radius, `1px solid rgba(15,23,42,0.14)`, white bg.
     - Top row: 7px gap. Colored dot 8×8 circle with `0 0 0 3px <color>22` outer ring (matched to band).
     - Label: Fraunces 14px / 700, letter-spacing -0.2, color `#0e1d4f`, no-wrap.
     - Sub line: 10px `#94a3b8` 500. Format: `<sub> · <bold count> tempat` (count uses 700 `#475569`).
   - **Edge fades + arrow buttons**: at left and right of the rail, gradient fades in/out based on `scrollLeft` / `scrollWidth`, paired with circular nav arrow buttons that nudge the scroll by ±140px on click. Hide both ends at the limits.
   - Count for each band is `round(baseCount * areaMultiplier)` where multiplier is `Bintaro: 1.0`, `BSD: 0.78`, `Semua: 1.7`. Always at least 1.
   - **Sekolah bands** (school levels with age range as sub):
     - `Preschool` · `2–4 thn` — base count 2, dot `#f59e0b`
     - `TK` · `4–6 thn` — 3, `#ef6f6c`
     - `SD` · `6–12 thn` — 5, `#1f9b6a`
     - `SMP` · `12–15 thn` — 3, `#3a64ee`
     - `SMA` · `15–18 thn` — 2, `#9c5a7a`
   - **Kursus bands** (age band with life-stage as label, range as sub):
     - `Bayi` · `0–1 thn` — 1, `#f59e0b`
     - `Toddler` · `1–3 thn` — 2, `#ef6f6c`
     - `Preschooler` · `3–6 thn` — 3, `#1f9b6a`
     - `Pre-Teen` · `6–12 thn` — 4, `#3a64ee`
     - `Teenager` · `12+ thn` — 2, `#9c5a7a`

6. **Indeks list "INDEKS — KATEGORI LAIN"** (28px top padding, 22px horizontal)
   - Eyebrow (10px / 800 / letter-spacing 1.2 / `#94a3b8`).
   - Below: a 1px top divider then rows separated by `1px solid rgba(15,23,42,0.08)`, each row `padding: 11px 0`.
   - **Row layout** (`display:flex; align-items:center; gap:14px;`):
     - **Icon** (replaces the previous `03 04 05…` numbering) — a 22×22px stroked SVG in the accent color. Stroke 1.6px, round caps/joins, `currentColor` so it picks up `var(--tk-accent)`.
     - **Name** (`flex:1`, Fraunces 16px / 600, letter-spacing -0.3, color `#0e1d4f`, single-line truncate with ellipsis).
     - **Count** (10.5px / 600 / `#94a3b8`).
     - **Chevron right** (`<Chev stroke={2}/>` — small dark stroked chevron).
   - **Items** (icon → name → count). Use the **full original names** here:
     - 🐻 teddy-bear icon → `Daycares` · `11 tempat`
     - 🛝 slide icon → `Playgrounds` · `8 tempat`
     - 🩺 stethoscope icon → `Klinik Tumbuh Kembang` · `4 tempat`
     - ☕ coffee-cup icon → `Kafe Ramah Anak` · `7 tempat`
     - 🐾 paw-print icon → `Bermain Dengan Binatang` · `3 tempat`
     - 🌊 wave icon → `Kolam Renang & Waterparks` · `5 tempat`
     - 📖 open-book icon → `Toko Buku & Alat Tulis` · `2 tempat`
     - … three-dots icon → `Lainnya` · `+ 4 kategori`
   - The exact SVG path data for all 8 icons lives in the `Ico` object inside `home-v1-polished.jsx` — copy those paths verbatim, or substitute equivalents from your icon library (lucide / Phosphor / SF Symbols) at the same visual weight.

   > **Important:** The previous version showed numbered list items (`03 Daycares`, `04 Playgrounds`, …) using Fraunces tabular figures in the accent color. That has been **replaced with line icons**. Don't ship the numbered list.

7. **Cover Story "COVER STORY · TEMPAT UNGGULAN"** (28px top padding) — unchanged from previous version
   - White card, 6px radius, hairline border.
   - Photo region: aspect 4/3, full-bleed photo, gradient overlay `linear-gradient(180deg, rgba(14,29,79,0.05) 30%, rgba(14,29,79,0.75) 100%)`.
   - Top-left badge: `★ EDITOR'S PICK NO. 01` — `#0e1d4f` bg, `#f6f1e8` text, 9.5px / 800, 4×9px padding.
   - Top-right **save toggle**: 34×34 white circle (95% opacity), `0 6px 14px rgba(0,0,0,0.18)` shadow, heart icon (filled rose `#e26a6a` when saved). Spring pop on toggle: scale(1.18) for 250ms, cubic-bezier(.5,1.6,.4,1).
   - Bottom-left title: Fraunces 30px / 700, letter-spacing -0.6, white, max 240px, text-shadow `0 2px 12px rgba(0,0,0,0.4)`. Content: "Little Stars Montessori".
   - Bottom-right location: 10.5px / 600 white 95%, "📍 Bintaro Sektor 7".
   - Body: 14×16px padding, italic 12.5px `#475569` quote, then meta row: `★ 4.9 · 47 ulasan` (left), `Rp 2.5jt /bln` (right, 700 `#0e1d4f`).

8. **Articles "BERITA & ARTIKEL"** (28px top padding) — unchanged
   - 3 rows, each: 14px vertical padding, hairline divider, 12px gap.
   - Left text block: tag (9.5px / 800 accent), title (Fraunces 16px / 700 letter-spacing -0.2), meta (11px `#94a3b8`).
   - Right thumbnail: 72×72, 4px radius, hairline border.
   - Items:
     - `PARENTING · 5 Cara Mengajarkan Anak Mengelola Emosi · 3 Apr · 4 menit`
     - `SEKOLAH · Sekolah Terbaik di Bintaro: Panduan Lengkap 2026 · 20 Apr · 7 menit`
     - `AKTIVITAS · Aktivitas Seru Akhir Pekan Bersama Anak di Tangsel · 15 Apr · 5 menit`

9. **CTA "UNTUK PEMILIK TEMPAT"** (24px top padding) — unchanged
   - Hairline-bordered card, 4px radius, 18px padding, row layout.
   - Left: eyebrow + Fraunces 18px / 700 "Daftarkan tempatmu."
   - Right: `Daftar →` button — `#0e1d4f` bg, white, 12px / 700, 10×14px padding, 4px radius.

10. **Footer mark**: centered `TANGSELKIDS · EDISI MEI 2026` (9.5px / 700, letter-spacing 1, `#94a3b8`), 20px top padding.

11. **Tab bar (fixed bottom)** — unchanged
    - 14px from edges, 14px from bottom, white card 28px radius, 6px padding, hairline border, `0 18px 40px rgba(15,23,42,0.12)` shadow.
    - 4 equal-flex items: `⌂ Beranda` `⌕ Jelajah` `♥ Tersimpan` `◯ Profil`.
    - Active item: `#0e1d4f` filled pill 22px radius, white text. Inactive: transparent bg, `#64748b` text. Both: 11px / 700, icon 14px on top with 3px margin.
    - Press: scale 0.94 for 140ms.

---

## Component Specs

### Logo (custom paper-square icon)

A 52×52 inline SVG. Composition (matches `Logo` component in `home-v1-polished.jsx`):

1. A tilted paper square — `<rect x=3 y=3 w=46 h=46 rx=4 fill="var(--tk-accent, #c47a14)"/>` rotated -6° around center.
2. A piece of "tape" across the top — `<rect x=18 y=-2 w=16 h=6 rx=1 fill="#f6b545" opacity=0.9/>` rotated +8°, layered before the rotation group resolves.
3. A burst of cream-white sun rays radiating from center — 8 short `<path>` strokes at compass points (N, S, E, W and four diagonals), `stroke="#fff7ec"`, strokeWidth 2, round caps.
4. A friendly **5-pointed star** in the center, fill `#0e1d4f` (deep blue ink), with two cream eyes (`#fff7ec` 0.9px circles) and a small smile (q-curve stroke `#fff7ec` 0.9px).

Use this exact SVG. If you must rebuild it, match: tilted mustard square, yellow tape strip, white sun-rays, deep-blue star face with eyes + smile in the center. Don't substitute a generic logo placeholder.

### Pressable wrapper

Every tappable element uses a press-scale wrapper:
- Default scale 0.97 (cards), 0.94 (chips/pills/buttons/age bands), 0.92 (small icon buttons), 0.85 (heart toggle, chevron button), 0.99 (list rows).
- Transition `transform .14s cubic-bezier(.2,.7,.3,1)`.
- On pointerdown apply scale, pointerup/pointerleave restore.

### Animated counter (used elsewhere in the app — kept available for the broader system)

Counts from 0 to target over 1100ms with cubic ease-out (`1 - (1-t)^3`). Uses requestAnimationFrame. **Note:** the editorial "Dari redaksi — 57 tempat" line that previously consumed this counter has been removed from the masthead. The component is still useful for the cover story rating count and similar.

### Typewriter

Component renders the full-bleed cycling tagline band in (3) above. State machine: `phase ∈ {typing, paused, deleting}`. On every render tick (via setTimeout chained), advance one character or transition phase. Be defensive with timer cleanup on unmount and word/word-index changes.

### Indeks line icons

Eight 24px-viewBox SVGs (24×24 with `stroke="currentColor"`, strokeWidth 1.6, round caps + joins). Source paths in the `Ico` object in `home-v1-polished.jsx`. Wrapper is 22×22 colored `var(--tk-accent)`.

If using an icon library:
- daycare → bear / teddy
- playground → slide
- clinic → stethoscope
- cafe → coffee cup with steam
- animals → paw print
- pool → wave / water
- books → open book
- more → horizontal three-dots

---

## Interactions & Behavior

| Trigger | Effect |
|---|---|
| Scroll past 140px | Sticky mini-masthead slides down (transform translateY 0, opacity 1, 300ms) |
| Mount | Full stage fades in (translateY 6→0, opacity 0→1, 500ms) |
| Typewriter loop | Characters type/delete continuously; caret blinks every 500ms; cycles through 7 words |
| Tap feature card | Toggle expand peek-sheet (animates open below the feature grid). Photo zooms 1→1.08, chevron rotates 0→90° |
| Tap other feature card while one expanded | Switch which is expanded |
| Tap area pill | Set `area`; counts in age-band rail update (multiplied by areaMultiplier) |
| Tap age band | Reserved for routing to the category page with `category + area + age-band` filters pre-applied |
| Scroll the age-band rail | Edge-fade + arrow visibility recompute on scroll; arrow click nudges by ±140px |
| Tap heart on cover | Toggle saved state, spring scale pop (250ms cubic-bezier(.5,1.6,.4,1)), filled rose when saved |
| Tap tab | Switch active tab, content swaps |
| Tap any indeks row | Route to the category page (e.g. `/c/daycares`) |

---

## State Management

| State | Owner | Type | Initial |
|---|---|---|---|
| `tab` | HomeV1Polished | `'home' \| 'search' \| 'save' \| 'user'` | `'home'` |
| `scrollY` | HomeV1Polished | number | 0 |
| `expandedFeature` (`open`) | FeaturePair | `'sekolah' \| 'kursus' \| null` | null |
| `area` | FeaturePair | `'Bintaro' \| 'BSD' \| 'Semua' \| null` | null |
| `wordIdx` | Typewriter | number | 0 |
| `phase` | Typewriter | `'typing' \| 'paused' \| 'deleting'` | `'typing'` |
| `text` | Typewriter | string (rendered chars) | `''` |
| `caretOn` | Typewriter | boolean (blinks) | true |
| `canL` / `canR` (rail) | AgeBands | boolean | computed from scrollLeft |
| `saved` (cover) | CoverStory | boolean | false |

In production, `saved` should persist (per-user, per-place) via your data layer. `area` and the expanded feature are ephemeral (don't persist).

---

## Data Requirements

The prototype uses static data; in production wire these to your API:

- **Featured categories** (Sekolah, Kursus): `{ slug, title, count, sub, photoUrl, tone, accent }` — content team curates.
- **Areas** (`AREAS` constant): `{ key, counts: { sekolah, kursus } }` — the count for each area × category combination drives both the area pill badge and the age-band counts (after multiplier).
- **Age bands**: `{ label, sub, dot, count }` per category. Currently static; can stay static (these are stable taxonomies) or be served from your category service.
- **Other categories indeks**: `{ icon, name, count, slug }`.
- **Cover story**: `{ id, name, area, photoUrl, quote, rating, reviewCount, priceLabel, badge }` — editor's pick of the week.
- **Articles**: `{ tag, title, meta, photoUrl, slug }` — CMS.

---

## Design Tokens

Reuse the existing `tokens.css` variables. The full set is in this bundle. The key ones used here:

```css
--tk-blue-400: #5b86fb;
--tk-blue-500: #3a64ee;
--tk-blue-700: #1e3fb0;
--tk-blue-950: #0e1d4f;   /* primary ink, button bg, sticky wordmark */
--tk-amber-400: #f6b545;  /* sekolah accent on dark, tape on logo */
--tk-rose-500:  #e26a6a;  /* heart fill, age band dot 'rose' */
--tk-emerald-500: #1f9b6a;/* tagline highlight, age band dot 'green' */
--tk-bg-warm:  #f3efe8;   /* paper background (note: prototype uses #efeae0 for the body bg) */
--tk-paper:    #ffffff;
--tk-muted:  #64748b;     /* secondary text */
--tk-muted-2:#94a3b8;     /* tertiary / eyebrow text */

/* prototype-introduced, tweakable from the Tweaks panel */
--tk-accent: #c47a14;     /* the editorial mustard accent (Tangsel ".", logo, indeks icons) */
```

Accent options exposed via Tweaks: `amber #c47a14`, `rose #d4506a`, `emerald #2e8a5a`, `violet #6f4ec1`. Default amber.

**Spacing scale (used consistently):** 4, 6, 8, 10, 11, 12, 14, 16, 18, 22, 24, 28 px.

**Radius scale:** 4 (CTA button), 6 (cards/photos), 8 (peek-sheet), 12 (age-band card, peek-sheet), 22 (active tab pill), 28 (tab bar), 999 (avatar, area pill, age-band dot).

**Shadows:**
- Cards (default): `0 12px 28px rgba(15,23,42,0.12)`
- Cards (expanded feature card): `0 14px 30px <accent>55` + border `1.5px solid <accent>`
- Tab bar: `0 18px 40px rgba(15,23,42,0.12)`
- Heart button: `0 6px 14px rgba(0,0,0,0.18)`

**Typography:**
- Display: **Fraunces** (Google) — opsz 9..144, weights 400/500/600/700, supports italic.
- UI: **Plus Jakarta Sans** (Google) — weights 400/500/600/700/800.
- Both must be available offline-capable / preconnected.

---

## Assets

The prototype uses **placeholder photos from Unsplash** for the cover story, feature cards, and article thumbnails. In production:

- **Cover story / feature cards / articles**: use the actual place's photo (or a stock photo licensed for commercial use) supplied by the content team.

Unsplash URLs currently in the prototype (replace before launch):

| Field | Current URL (Unsplash photo id) |
|---|---|
| Cover | `photo-1503676260728-1c00da094a0b` |
| Feature: Sekolah | `photo-1580582932707-520aed937b7b` |
| Feature: Kursus | `photo-1588072432836-e10032774350` |
| Article 1 | `photo-1503454537195-1dcabb73ffb9` |
| Article 2 | `photo-1588072432904-843af37f03ed` |
| Article 3 | `photo-1596464716127-f2a82984de30` |

Custom inline SVG for: the **Logo** (paper square + star face), the **Indeks line icons** (8 of them), the **Chevron** glyph (used throughout), and the **Heart** glyph (cover story save). These are all in `home-v1-polished.jsx`. Tab-bar icons currently use Unicode glyphs (`⌂ ⌕ ♥ ◯`) — replace with your icon library at the same visual weight for production.

---

## What's removed compared to the previous handoff

When migrating from the older alternate-home implementation, **delete** these pieces:

- **Confetti SVG** behind the masthead.
- **Polaroid kid-portrait stack** (KidPolaroids component, both photos, the yellow tape, parallax tilt).
- **"EDISI · MINGGU 18 — MEI 2026"** eyebrow row in the masthead.
- **"Dari redaksi. 57 tempat terkurasi…"** italic editor's note in the masthead.
- **Search bar** (`SearchBar` component, suggestions dropdown, area pill inside it).
- **`📍 BINTARO`** location pill on the right side of the **sticky** mini-masthead.
- **`★ MOST POPULAR`** glass badge on the feature cards.
- **Numbered indeks list** (`03 Daycares`, `04 Playgrounds`, …) — replaced by line-icon list.

Keep the data structures only if a future iteration may bring back search; otherwise feel free to drop the dead `SUGGESTIONS` array and `SearchBar` component along with the JSX usage.

---

## Files in this bundle

| File | What it is |
|---|---|
| `TangselKids Home V1 Polished.html` | Host HTML — wires React, fonts, the iOS device frame, and the Tweaks panel |
| `home-v1-polished.jsx` | All home-screen components (Shell, Masthead, Logo, Typewriter, FeaturePair, AreaPills, AgeBands, IndexList, CoverStory, ArticleList, TabBar, StickyHeader, etc.) — main reference |
| `tokens.css` | CSS variables — the design system tokens this design uses |
| `ios-frame.jsx` | The iOS device bezel used by the prototype (NOT for production — your app already runs on a real device) |
| `tweaks-panel.jsx` | The in-prototype tweaks UI (NOT for production) |

To run the prototype locally for reference: open `TangselKids Home V1 Polished.html` directly in a browser. The Tweaks panel exposes accent color (amber/rose/emerald/violet) and a frame on/off toggle.

---

## Build order suggestion

1. **Migrate the existing alternate-home route** behind the same feature flag as before. Don't fork a new route; replace the contents.
2. **Tokens** — confirm `--tk-accent` already exists in your codebase from the previous handoff; reuse.
3. **Strip removed pieces** (see "What's removed" above) — confetti, polaroids, eyebrow date, editor's note, search bar, BINTARO sticky pill, MOST POPULAR badge, numbered indeks rows.
4. **Add Logo** component (custom SVG) and replace the masthead's left slot.
5. **Add Typewriter** band component and place under masthead.
6. **Add Peek-sheet** with **AreaPills** + **AgeBands** sub-components (the area-multiplier math, the rail with edge-fades + arrow nudgers).
7. **Replace IndexList rows** — swap leading number for `<Ico />` element, restore original full names, bump font size to 16px.
8. **Polish** — sticky masthead loses its location pill, avatar shrinks to 26×26, feature card content layer becomes `position: absolute; inset: 0; box-sizing: border-box; justify-content: flex-end` so the count + chevron row lands inside the card without clipping (this was a real bug in the prototype before the fix; mirror the structure exactly).
9. **QA on small devices** (iPhone SE-class, 360-wide Androids) — verify the feature pair grid doesn't crowd, age-band rail scrolls smoothly, sticky masthead doesn't overlap status bar.

Done means: the alternate home matches this prototype pixel-for-pixel within your styling system, all interactions feel native, the older alternate-home pieces are fully removed, and the original (non-alternate) home screen is **untouched**.
