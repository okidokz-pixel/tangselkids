"use client";

import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagInput({ value, onChange, placeholder = "Type and press Enter…", suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s),
  );

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 10px",
        border: "1.5px solid #d1d5db", borderRadius: 8, background: "#fff",
        minHeight: 42, alignItems: "center",
      }}>
        {value.map((tag) => (
          <span key={tag} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", background: "#eff2fa", borderRadius: 6,
            fontSize: 13, color: "#0e1d4f", fontWeight: 500,
          }}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0, lineHeight: 1, fontSize: 14 }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ""}
          style={{
            border: "none", outline: "none", fontSize: 13, flex: 1,
            minWidth: 120, background: "transparent", color: "#111827",
          }}
        />
      </div>

      {showSuggestions && input && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)", maxHeight: 200, overflowY: "auto", marginTop: 4,
        }}>
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => addTag(s)}
              style={{
                display: "block", width: "100%", padding: "8px 14px",
                textAlign: "left", background: "none", border: "none",
                fontSize: 13, color: "#374151", cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
