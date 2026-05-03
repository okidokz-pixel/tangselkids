<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mobile testing — read this FIRST before debugging touch issues

**iOS Safari does NOT reliably hydrate React when served from `next dev` (Turbopack HMR).**
The static HTML loads, links navigate, but `onClick` / `onChange` / any event handler never fires — making it look like every button on the page is broken. Desktop Chrome has no such issue, which makes this look like a CSS/touch bug when it isn't.

When the user reports "buttons don't work on iPhone but work on PC":
1. **First test**: stop `npm run dev`, run `npm run build && npm run start`, retest on iPhone.
2. If it works in production → it was Turbopack HMR. Don't refactor any code.
3. Only if it still fails in production → start looking at the iOS WebKit touch rules below.

This rule has cost multiple debugging sessions. Test against `npm run start` before changing component patterns.

# iOS WebKit touch rules — NEVER violate these

These rules come from a hard-won debugging session. Violating any one of them causes buttons and interactive elements to silently stop working on iPhone (both Safari and Chrome), while desktop Chrome is completely unaffected.

## 1. Never use `transform` to center fixed/sticky elements
iOS promotes `transform`ed fixed elements to GPU compositing layers. Touch hit-testing across compositing layers is broken on iOS WebKit and silently swallows taps.

```tsx
// ❌ BROKEN on iOS
style={{ position: "fixed", left: "50%", transform: "translateX(-50%)" }}

// ✅ CORRECT
style={{ position: "fixed", left: 14, right: 14, margin: "0 auto", maxWidth: 420 }}
```

## 2. Never use `overflow: hidden` on a container that has interactive children
`position: relative` + `overflow: hidden` blocks touch events from reaching child elements in iOS Safari.

```tsx
// ❌ BROKEN on iOS — clips touch events
style={{ position: "relative", overflow: "hidden", borderRadius: 32 }}

// ✅ CORRECT — clips visually only, touch events pass through
style={{ position: "relative", overflow: "clip", borderRadius: 32 }}
```

## 3. Never use `backdrop-filter` / `backdrop-blur` on tappable elements
`backdrop-filter` creates a compositing layer on iOS WebKit that interferes with touch routing.

```tsx
// ❌ BROKEN on iOS
className="backdrop-blur-sm"

// ✅ CORRECT — use a semi-transparent background instead
style={{ background: "rgba(255,255,255,0.20)" }}
```

## 4. Two button patterns — pick the right one

There are TWO interactive patterns. They are NOT interchangeable.

### 4a. SELECTION chips → `label` + controlled `<input type="radio">`
Use this ONLY for "pick one of N" selectors where the radio's `checked` state literally matches the post-tap state. Example: area filter (Bintaro/BSD/All).
```tsx
<label style={{ cursor: "pointer" }}>
  <input type="radio" name="f-area" value="bintaro"
    checked={area === "bintaro"} onChange={() => setArea("bintaro")}
    style={{ position: "absolute", opacity: 0, width: 1, height: 1 }} />
  <span style={checked ? activeStyle : inactiveStyle}>Bintaro</span>
</label>
```
This works because tapping flips the radio from `false` → `true`, and React's re-render confirms it (`checked` matches new state).

### 4b. ACTION buttons → `<button>` + onClick + onTouchEnd + `touchAction: "manipulation"`
Use this for any button that triggers an ACTION (Reset, Show Results, Filter, Sort, Clear, X-remove, Compare, etc.). The `<label>+radio` pattern is UNRELIABLE here because React 19 fights the radio state flip when `checked` is always `false`.
```tsx
<button
  onClick={resetFilters}
  onTouchEnd={(e) => { e.preventDefault(); resetFilters(); }}
  style={{ ..., touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent", cursor: "pointer" }}
>
  Reset
</button>
```
Use the shared `ActionButton` component in `src/components/ActionButton.tsx` — it bakes in the iOS-safe touch handlers.

**Why both `onClick` AND `onTouchEnd`:** iOS Safari's React 19 synthetic `onClick` is sometimes swallowed (especially after compositing-layer transitions). The native `touchend` event fires reliably on labels/buttons; `e.preventDefault()` then prevents the duplicate synthetic click.

## 5. Viewport must include `maximum-scale=1`
Without this, iOS adds a 300ms tap delay on all elements. Set once in `layout.tsx`:
```ts
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false,
};
```

# Tailwind v4 broken utilities — always use inline styles for these

Tailwind v4's build does NOT reliably generate certain utility classes in this project. Using them silently has no effect (computed style stays at browser default). **Always use inline `style={{}}` instead of Tailwind classes for:**

- `min-w-*` → use `style={{ minWidth: 0 }}` (or whatever value)
- `max-w-*` → use `style={{ maxWidth: "..." }}`
- Any utility that isn't visually working as expected → verify with `getComputedStyle(el).propertyName` in DevTools, and switch to inline style if the Tailwind class isn't applied

```tsx
// ❌ Silently ignored in this project's Tailwind v4 build
<div className="flex-1 min-w-0">

// ✅ CORRECT — inline style is always applied
<div className="flex-1" style={{ minWidth: 0 }}>
```
