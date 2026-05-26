"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveArticle, deleteArticle } from "@/app/admin/actions";
import { ImageUpload } from "./ImageUpload";
import { TiptapEditor } from "./TiptapEditor";

function generateSlug(title: string) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ArticleForm({ initial, id }: { initial?: Record<string, any>; id?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.cover_image_url ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);
  const [publishedAt, setPublishedAt] = useState(
    initial?.published_at ? initial.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [body, setBody] = useState<object | null>(initial?.body ?? null);
  // Ref always holds the latest body — guards against stale closure in handleSave
  const bodyRef = useRef<object | null>(initial?.body ?? null);
  function handleBodyChange(json: object) {
    bodyRef.current = json;
    setBody(json);
  }
  // Live pull from the editor at save time — the source of truth for the body.
  const getEditorJsonRef = useRef<(() => object) | null>(null);

  function handleTitleChange(t: string) {
    setTitle(t);
    if (!id) setSlug(generateSlug(t));
  }

  async function handleSave(publish?: boolean) {
    setSaveError("");
    const shouldPublish = publish ?? isPublished;
    if (publish) setIsPublished(true);
    // Pull the editor's current content directly; fall back to the ref.
    const rawBody = getEditorJsonRef.current ? getEditorJsonRef.current() : bodyRef.current;
    // ProseMirror's getJSON returns nodes whose `attrs` objects have a
    // non-plain prototype. Passed as-is across the Server Action boundary,
    // React turns them into opaque client references and the `attrs` (image
    // src, heading level, etc.) get dropped before the DB write. Deep-cloning
    // to plain JSON guarantees a fully serializable payload.
    const liveBody = rawBody ? JSON.parse(JSON.stringify(rawBody)) : null;
    bodyRef.current = liveBody;
    const payload = {
      title, slug, excerpt: excerpt || null,
      cover_image_url: coverImageUrl || null,
      is_published: shouldPublish,
      published_at: shouldPublish && publishedAt ? new Date(publishedAt).toISOString() : null,
      body: liveBody,  // always the latest, never stale
    };
    startTransition(async () => {
      try {
        await saveArticle(id ?? null, payload);
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  async function handleDelete() {
    if (!id) return;
    startTransition(async () => {
      try {
        await deleteArticle(id);
      } catch (e: unknown) {
        setSaveError(e instanceof Error ? e.message : "Delete failed");
      }
    });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <button type="button" onClick={() => router.push("/admin/articles")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, padding: 0, marginBottom: 4 }}>
            ← Articles
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0e1d4f", margin: 0 }}>
            {id ? title || "Edit Article" : "New Article"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {id && slug && (
            <a href={`/berita/${slug}`} target="_blank" rel="noopener noreferrer"
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1.5px solid #d1d5db", background: "#fff", color: "#374151", textDecoration: "none" }}>
              Preview ↗
            </a>
          )}
          {id && !confirmDelete && (
            <button type="button" onClick={() => setConfirmDelete(true)}
              style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1.5px solid #fca5a5", background: "#fef2f2", color: "#dc2626", cursor: "pointer" }}>
              Delete
            </button>
          )}
          {confirmDelete && (
            <>
              <span style={{ fontSize: 13, color: "#dc2626" }}>Sure?</span>
              <button type="button" onClick={handleDelete} disabled={isPending}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#dc2626", color: "#fff", border: "none", cursor: "pointer" }}>
                Yes, Delete
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer" }}>
                Cancel
              </button>
            </>
          )}
          {!isPublished ? (
            <>
              <button type="button" onClick={() => handleSave(false)} disabled={isPending}
                style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#fff", color: "#374151", border: "1.5px solid #d1d5db", cursor: isPending ? "not-allowed" : "pointer" }}>
                {isPending ? "Saving…" : "Save Draft"}
              </button>
              <button type="button" onClick={() => handleSave(true)} disabled={isPending}
                style={{ padding: "8px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: isPending ? "#9ca3af" : "#2e8a5a", color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer" }}>
                {isPending ? "Saving…" : "🚀 Publish"}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { setIsPublished(false); handleSave(false); }} disabled={isPending}
                style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#fff", color: "#dc2626", border: "1.5px solid #fca5a5", cursor: isPending ? "not-allowed" : "pointer" }}>
                Unpublish
              </button>
              <button type="button" onClick={() => handleSave()} disabled={isPending}
                style={{ padding: "8px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: isPending ? "#9ca3af" : "#0e1d4f", color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer" }}>
                {isPending ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      {saveError && (
        <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", fontSize: 13, color: "#dc2626" }}>
          {saveError}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
        {/* Main editor column */}
        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Article title…" />
          </div>

          <div>
            <label style={labelStyle}>Slug *</label>
            <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} />
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>URL: /berita/{slug || "…"}</div>
          </div>

          <div>
            <label style={labelStyle}>Excerpt</label>
            <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary shown in article lists…" />
          </div>

          <div>
            <label style={labelStyle}>Body</label>
            <TiptapEditor
              value={body}
              onChange={handleBodyChange}
              entityId={id ?? "new-article"}
              placeholder="Start writing your article…"
              registerGetJson={(fn) => { getEditorJsonRef.current = fn; }}
            />
          </div>
        </div>

        {/* Sidebar column */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* Publish settings */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 14 }}>Publish Settings</div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 14 }}>
              <div
                onClick={() => setIsPublished(!isPublished)}
                style={{
                  width: 40, height: 22, borderRadius: 11, position: "relative",
                  background: isPublished ? "#0e1d4f" : "#d1d5db", cursor: "pointer",
                  transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: isPublished ? 21 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s",
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
                {isPublished ? "Published" : "Draft"}
              </span>
            </label>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Publish Date</label>
              <input type="date" style={inputStyle} value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
          </div>

          {/* Cover image */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 14 }}>Cover Image</div>
            <ImageUpload
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              bucket="articles"
              path={`${id ?? "new"}/cover_${Date.now()}.jpg`}
              label=""
              aspectRatio="16/9"
              width={264}
              height={148}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .article-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #d1d5db", fontSize: 14, color: "#111827",
  outline: "none", boxSizing: "border-box", background: "#fff",
};
