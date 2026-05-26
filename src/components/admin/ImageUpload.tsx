"use client";

import { useRef, useState } from "react";

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
            <img
              src={value}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                style={{
                  padding: "6px 12px", borderRadius: 6, background: "#fff",
                  fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                }}
              >Replace</button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                style={{
                  padding: "6px 12px", borderRadius: 6, background: "#ef4444", color: "#fff",
                  fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                }}
              >Remove</button>
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

  function movePhoto(from: number, to: number) {
    const arr = [...photos];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        {photos.map((url, idx) => (
          <div key={url} style={{
            width: 120, height: 80, borderRadius: 8, overflow: "clip",
            position: "relative", border: "1.5px solid #e5e7eb", flexShrink: 0,
          }}>
            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              opacity: 0, transition: "opacity 0.15s",
            }}
              className="photo-overlay"
            >
              {idx > 0 && (
                <button type="button" onClick={() => movePhoto(idx, idx - 1)}
                  style={{ background: "#fff", border: "none", borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontSize: 12 }}>
                  ◀
                </button>
              )}
              {idx < photos.length - 1 && (
                <button type="button" onClick={() => movePhoto(idx, idx + 1)}
                  style={{ background: "#fff", border: "none", borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontSize: 12 }}>
                  ▶
                </button>
              )}
              <button type="button" onClick={() => removePhoto(idx)}
                style={{ background: "#ef4444", border: "none", borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontSize: 12, color: "#fff" }}>
                ✕
              </button>
            </div>
            <div style={{
              position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.6)",
              color: "#fff", fontSize: 10, borderRadius: 4, padding: "1px 5px",
            }}>
              {idx + 1}
            </div>
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
              fontSize: 11, color: "#9ca3af", gap: 4,
            }}
          >
            <span style={{ fontSize: 20 }}>{uploading ? "⏳" : "+"}</span>
            {uploading ? "Uploading…" : "Add Photo"}
          </button>
        )}
      </div>

      {error && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 8 }}>{error}</div>}
      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        {photos.length}/{maxPhotos} photos · Use ◀▶ arrows to reorder
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
        div:hover > .photo-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
