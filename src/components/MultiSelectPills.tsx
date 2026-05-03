"use client";

/**
 * MultiSelectPills
 * ─────────────────────────────────────────────────────────────
 * Renders a wrapping row of pill-shaped toggles for multi-select
 * filter chips. Uses the iOS-safe label+checkbox pattern so every
 * pill is reliably tappable on Safari/WebKit.
 *
 * Props
 *   options   – array of { value, label } pairs
 *   selected  – Set (or array) of currently-active values
 *   onChange  – called with the full new Set after each tap
 *   max       – optional cap on how many can be selected at once
 */

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

export function MultiSelectPills({ options, selected, onChange, max }: Props) {
  function toggle(value: string) {
    const isOn = selected.includes(value);
    if (isOn) {
      onChange(selected.filter((v) => v !== value));
    } else {
      if (max !== undefined && selected.length >= max) return;
      onChange([...selected, value]);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(({ value, label }) => {
        const active = selected.includes(value);
        return (
          <label
            key={value}
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Visually hidden checkbox – iOS-safe multi-select */}
            <input
              type="checkbox"
              checked={active}
              onChange={() => toggle(value)}
              style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }}
            />
            <span
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                letterSpacing: -0.1,
                lineHeight: 1,
                border: active ? "1.5px solid var(--tk-accent, #2e8a5a)" : "1.5px solid #e2e8f0",
                background: active ? "var(--tk-accent, #2e8a5a)" : "#fff",
                color: active ? "#fff" : "#475569",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                userSelect: "none",
                WebkitUserSelect: "none",
              }}
            >
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
