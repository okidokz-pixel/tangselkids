"use client";

import { useRef, useState } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  path: string;
  label?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
}

export function ImageUpload({
  value, onChange, bucket, path, label = "Image",
  aspectRatio = "16/9", width = 280, height = 160,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    formData.append("path", path);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const json = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(json.error ?? "Upload failed");
      return;
    }
    onChange(json.url);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleRemove() {
    onChange("");
  }

  return (
    <div>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>{label}</div>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !value && inputRef.current?.click()}
        style={{
          width, height, borderRadius: 10, overflow: "clip",
          border: value ? "1.5px solid #e5e7eb" : "2px dashed #d1d5db",
          background: value ? "transparent" : "#f9fafb",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: value ? "default" : "pointer", position: "relative",
          aspectRatio,
        }}
      >
        {uploading ? (
          <div style={{ textAlign: "center", color: "#6b7280" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 12 }}>Uploading…</div>
          </div>
        ) : value ? (
          <>
            <OptimizedImage
              src={value}
              alt=""
              fill
              sizes="200px"
              style={{ objectFit: "cover" }}
            />
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 8,
              opacity: 0, transition: "opacity 0.15s",
            }}
              className="img-overlay"
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                title="Replace image"
                style={{
                  width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.92)",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#374151",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                title="Remove image"
                style={{
                  width: 34, height: 34, borderRadius: 8, background: "rgba(220,38,38,0.88)",
                  border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff",
                }}
              >
                <TrashIcon />
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", color: "#9ca3af" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
            <div style={{ fontSize: 12 }}>Click or drag to upload</div>
          </div>
        )}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>{error}</div>
      )}

      {/* URL input */}
      <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste image URL…"
          style={{
            flex: 1, padding: "7px 10px", borderRadius: 7, fontSize: 13,
            border: "1.5px solid #d1d5db", outline: "none", color: "#111827",
          }}
        />
        <button
          type="button"
          disabled={!urlInput.trim()}
          onClick={() => { if (urlInput.trim()) { onChange(urlInput.trim()); setUrlInput(""); } }}
          style={{
            padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600,
            background: urlInput.trim() ? "#0e1d4f" : "#e5e7eb",
            color: urlInput.trim() ? "#fff" : "#9ca3af",
            border: "none", cursor: urlInput.trim() ? "pointer" : "default",
          }}
        >
          Use
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <style>{`
        .img-overlay:hover, div:hover > .img-overlay { opacity: 1 !important; background: rgba(0,0,0,0.4) !important; }
      `}</style>
    </div>
  );
}

// ── Multi-photo grid (photo_1 … photo_N) ──────────────────────────────────────

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

interface PhotoGridProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  bucket: string;
  entityId: string;
  maxPhotos?: number;
}

export function PhotoGrid({ photos, onChange, bucket, entityId, maxPhotos = 10 }: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop() ?? "jpg";
    const slot = photos.length + 1;
    const path = `${entityId}/photo_${slot}_${Date.now()}.${ext}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    formData.append("path", path);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const json = await res.json();
    setUploading(false);

    if (!res.ok) { setError(json.error ?? "Upload failed"); return; }
    onChange([...photos, json.url]);
  }

  function removePhoto(idx: number) {
    onChange(photos.filter((_, i) => i !== idx));
  }

  function handleDragStart(idx: number) {
    dragIndex.current = idx;
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOver(idx);
  }

  function handleDrop(idx: number) {
    if (dragIndex.current === null || dragIndex.current === idx) {
      setDragOver(null);
      return;
    }
    const arr = [...photos];
    const [item] = arr.splice(dragIndex.current, 1);
    arr.splice(idx, 0, item);
    onChange(arr);
    dragIndex.current = null;
    setDragOver(null);
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setDragOver(null);
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        {photos.map((url, idx) => (
          <div
            key={url}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
            style={{
              width: 120, height: 80, borderRadius: 8, overflow: "clip",
              position: "relative", flexShrink: 0, cursor: "grab",
              border: dragOver === idx ? "2.5px solid #2e8a5a" : "1.5px solid #e5e7eb",
              opacity: dragIndex.current === idx ? 0.4 : 1,
              transition: "border-color 0.15s, opacity 0.15s",
            }}
          >
            <OptimizedImage src={url} alt="" fill sizes="120px" style={{ objectFit: "cover", pointerEvents: "none" }} />

            {/* Delete button — always visible top-right */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
              style={{
                position: "absolute", top: 4, right: 4,
                background: "rgba(220,38,38,0.85)", border: "none", borderRadius: 5,
                width: 24, height: 24, cursor: "pointer", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0, transition: "opacity 0.15s",
              }}
              className="pg-trash"
            >
              <TrashIcon />
            </button>

            {/* Badge: MAIN for first, number for rest */}
            {idx === 0 ? (
              <div style={{
                position: "absolute", bottom: 4, left: 4,
                background: "#2e8a5a", color: "#fff",
                fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 6px",
                letterSpacing: "0.05em",
              }}>
                MAIN
              </div>
            ) : (
              <div style={{
                position: "absolute", top: 4, left: 4,
                background: "rgba(0,0,0,0.55)", color: "#fff",
                fontSize: 10, borderRadius: 4, padding: "1px 5px",
              }}>
                {idx + 1}
              </div>
            )}
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              width: 120, height: 80, borderRadius: 8, border: "2px dashed #d1d5db",
              background: "#f9fafb", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
              fontSize: 11, color: "#9ca3af", gap: 4, flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 20 }}>{uploading ? "⏳" : "+"}</span>
            {uploading ? "Uploading…" : "Add Photo"}
          </button>
        )}
      </div>

      {error && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 8 }}>{error}</div>}
      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        {photos.length}/{maxPhotos} photos · Drag to reorder · First photo is the main thumbnail
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []).slice(0, maxPhotos - photos.length);
          for (const f of files) await uploadFile(f);
          e.target.value = "";
        }}
      />
      <style>{`
        div:hover > .pg-trash, .pg-trash:focus { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
