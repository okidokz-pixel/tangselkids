"use client";
import { useRef, useCallback } from "react";

/**
 * RangeSlider
 * ─────────────────────────────────────────────────────────────
 * Dual-handle range slider backed by two overlapping
 * <input type="range" class="tk-range"> elements.
 * The filled track is a <div> computed from lo/hi percentages.
 *
 * Props
 *   min, max        – absolute bounds
 *   lo, hi          – current low/high handles
 *   step            – snap increment (default 1)
 *   onLoChange      – called when the low handle moves
 *   onHiChange      – called when the high handle moves
 *   formatLabel     – optional formatter for tooltip / preset labels
 *   presets         – optional quick-pick chips [{ label, lo, hi }]
 *   onPreset        – called when a preset chip is tapped
 */

type Preset = { label: string; lo: number; hi: number };

type Props = {
  min: number;
  max: number;
  lo: number;
  hi: number;
  step?: number;
  onLoChange: (v: number) => void;
  onHiChange: (v: number) => void;
  formatLabel?: (v: number) => string;
  presets?: Preset[];
  onPreset?: (p: Preset) => void;
};

function pct(val: number, min: number, max: number) {
  return ((val - min) / (max - min)) * 100;
}

export function RangeSlider({
  min, max, lo, hi, step = 1,
  onLoChange, onHiChange,
  formatLabel,
  presets,
  onPreset,
}: Props) {
  const loPct = pct(lo, min, max);
  const hiPct = pct(hi, min, max);
  const fmt = formatLabel ?? String;

  // Keep lo ≤ hi with a 1-step gap
  const handleLo = useCallback((v: number) => {
    onLoChange(Math.min(v, hi - step));
  }, [hi, step, onLoChange]);

  const handleHi = useCallback((v: number) => {
    onHiChange(Math.max(v, lo + step));
  }, [lo, step, onHiChange]);

  return (
    <div>
      {/* Value labels */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 12,
        fontFamily: "var(--font-jakarta), system-ui, sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: "#1e3fb0",
      }}>
        <span>{fmt(lo)}</span>
        <span>{fmt(hi)}</span>
      </div>

      {/* Track + thumbs */}
      <div style={{ position: "relative", height: 6, margin: "0 11px" }}>
        {/* Full-width background track */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "#e2e8f0",
          borderRadius: 3,
        }} />

        {/* Filled segment between lo and hi */}
        <div style={{
          position: "absolute",
          top: 0,
          left: `${loPct}%`,
          width: `${hiPct - loPct}%`,
          bottom: 0,
          background: "#1d4ed8",
          borderRadius: 3,
        }} />

        {/* Low handle */}
        <input
          type="range"
          className="tk-range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => handleLo(Number(e.target.value))}
          style={{ zIndex: lo > max - step ? 5 : 3 }}
        />

        {/* High handle */}
        <input
          type="range"
          className="tk-range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => handleHi(Number(e.target.value))}
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Preset chips */}
      {presets && presets.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {presets.map((p) => {
            const active = p.lo === lo && p.hi === hi;
            return (
              <button
                key={p.label}
                onClick={() => onPreset?.(p)}
                onTouchEnd={(e) => { e.preventDefault(); onPreset?.(p); }}
                style={{
                  padding: "5px 12px",
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-jakarta), system-ui, sans-serif",
                  border: active ? "1.5px solid #1d4ed8" : "1.5px solid #e2e8f0",
                  background: active ? "#1d4ed8" : "#fff",
                  color: active ? "#fff" : "#64748b",
                  cursor: "pointer",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  transition: "background 0.12s, color 0.12s",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
