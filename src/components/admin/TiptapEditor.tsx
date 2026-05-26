"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState, useEffect } from "react";

const SIZE_PRESETS = [
  { label: "Small",  value: "300px" },
  { label: "Medium", value: "500px" },
  { label: "Large",  value: "700px" },
  { label: "Full",   value: ""      },
];

// Image extension extended to support a width attribute
const ImageWithWidth = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attrs) => attrs.width ? { style: `max-width: ${attrs.width}; width: 100%;` } : {},
        parseHTML: (el) => (el as HTMLImageElement).style.maxWidth || null,
      },
    };
  },
});

interface TiptapEditorProps {
  value: object | null;
  onChange: (json: object) => void;
  entityId: string;
  placeholder?: string;
  // Lets the parent pull the editor's live JSON at save time, bypassing any
  // onChange/state staleness. Critical: the save must reflect exactly what the
  // editor currently holds, not whatever the last onChange happened to capture.
  registerGetJson?: (getJson: () => object) => void;
}

export function TiptapEditor({ value, onChange, entityId, placeholder = "Start writing your article…", registerGetJson }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgModal, setImgModal] = useState<{ open: boolean; url: string; size: string; targetPos: number | null }>({
    open: false, url: "", size: "", targetPos: null,
  });

  const editor = useEditor({
    immediatelyRender: false, // required for Next.js SSR — avoids hydration mismatch warning
    extensions: [
      // StarterKit v3 bundles Link; configure it here instead of adding a
      // second Link extension (which triggers a "duplicate extension" warning).
      StarterKit.configure({ link: { openOnClick: false } }),
      ImageWithWidth.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? "",
    editorProps: {
      attributes: { style: "outline: none; min-height: 400px; font-size: 15px; line-height: 1.7; color: #111827;" },
    },
  });

  // Keep onUpdate wired via effect so the callback is always fresh
  useEffect(() => {
    if (!editor) return;
    const handler = () => onChange(editor.getJSON());
    editor.on("update", handler);
    return () => { editor.off("update", handler); };
  }, [editor, onChange]);

  // Expose a live getJSON to the parent so saving reads the editor's actual
  // current content rather than a possibly-stale onChange snapshot.
  useEffect(() => {
    if (!editor || !registerGetJson) return;
    registerGetJson(() => editor.getJSON());
  }, [editor, registerGetJson]);

  // Click on any empty image placeholder → select it in ProseMirror, then open URL modal
  const editorWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = editorWrapRef.current;
    if (!wrap || !editor) return;
    const handler = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest("img") as HTMLImageElement | null;
      if (img && !img.getAttribute("src")) {
        // Record the placeholder image node's doc position. We fill it by
        // position later (setNodeMarkup) — the editor's selection can't be
        // relied on once the modal's autoFocus input steals focus.
        let imagePos = -1;
        editor.state.doc.descendants((node, nodePos) => {
          if (imagePos >= 0) return false; // already found
          if (node.type.name === "image" && !node.attrs.src) {
            const dom = editor.view.nodeDOM(nodePos);
            if (dom === img || (dom as HTMLElement)?.contains?.(img)) {
              imagePos = nodePos;
              return false;
            }
          }
        });
        setImgModal({ open: true, url: "", size: "", targetPos: imagePos >= 0 ? imagePos : null });
      }
    };
    wrap.addEventListener("click", handler);
    return () => wrap.removeEventListener("click", handler);
  }, [editor]);

  if (!editor) return null;

  async function uploadAndInsertImage(file: File) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${entityId}/${Date.now()}.${ext}`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "articles");
    formData.append("path", path);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (res.ok && json.url) {
      // Insert directly — no modal, no async state round-trip
      editor!.chain().focus().insertContent({
        type: "image",
        attrs: { src: json.url, alt: null, title: null, width: null },
      }).run();
      onChange(editor!.getJSON());
    }
  }

  function insertImage() {
    const src = imgModal.url.trim();
    if (!src) return;
    const width = imgModal.size || null;
    const targetPos = imgModal.targetPos;

    if (targetPos != null) {
      // Fill the clicked placeholder by its recorded position. Using
      // setNodeMarkup (not updateAttributes-on-selection) makes this work
      // even though the modal's autoFocus has blurred the editor.
      editor!.chain().focus().command(({ tr, state }) => {
        const node = state.doc.nodeAt(targetPos);
        if (node && node.type.name === "image") {
          tr.setNodeMarkup(targetPos, undefined, { ...node.attrs, src, width });
          return true;
        }
        return false;
      }).run();
    } else {
      // No placeholder targeted → insert a brand-new image node
      editor!.chain().focus().insertContent({
        type: "image",
        attrs: { src, alt: null, title: null, width },
      }).run();
    }

    // Explicitly sync body state regardless of onUpdate timing
    onChange(editor!.getJSON());
    setImgModal({ open: false, url: "", size: "", targetPos: null });
  }

  function setLink() {
    const url = window.prompt("URL:", editor!.getAttributes("link").href ?? "https://");
    if (url === null) return;
    if (url === "") { editor!.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const btn = (active: boolean) => ({
    padding: "5px 9px", borderRadius: 6, fontSize: 13, fontWeight: 600,
    border: "1.5px solid",
    borderColor: active ? "#0e1d4f" : "#d1d5db",
    background: active ? "#0e1d4f" : "#fff",
    color: active ? "#fff" : "#374151",
    cursor: "pointer", fontFamily: "inherit",
  } as React.CSSProperties);

  return (
    <div ref={editorWrapRef} style={{ border: "1.5px solid #d1d5db", borderRadius: 10, overflow: "clip", background: "#fff" }}>
      {/* Toolbar — sticky so it stays visible while scrolling the article */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4, padding: "10px 12px",
        borderBottom: "1px solid #e5e7eb", background: "#f9fafb",
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <button type="button" style={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" style={{ ...btn(editor.isActive("italic")), fontStyle: "italic" }} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" style={btn(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()}>S̶</button>
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        <button type="button" style={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" style={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        <button type="button" style={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" style={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" style={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>" Quote</button>
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        <button type="button" style={btn(editor.isActive("link"))} onClick={setLink}>🔗 Link</button>
        <button type="button" style={btn(false)} onClick={() => fileInputRef.current?.click()}>📷 Photo</button>
        <button type="button" style={btn(false)} onClick={() => setImgModal({ open: true, url: "", size: "", targetPos: null })}>🔗 Image URL</button>
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        <button type="button" style={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}>── HR</button>
        <div style={{ width: 1, background: "#e5e7eb", margin: "0 4px" }} />
        <button type="button" style={btn(false)} onClick={() => editor.chain().focus().undo().run()}>↩ Undo</button>
        <button type="button" style={btn(false)} onClick={() => editor.chain().focus().redo().run()}>↪ Redo</button>
      </div>

      {/* Editor area */}
      <div style={{ padding: "16px 20px" }}>
        <EditorContent editor={editor} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadAndInsertImage(f);
          e.target.value = "";
        }}
      />

      <style>{`
        .tiptap img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
        .tiptap a { color: #2563eb; text-decoration: underline; }
        .tiptap blockquote { border-left: 3px solid #d1d5db; padding-left: 16px; color: #6b7280; margin: 12px 0; }
        .tiptap h2 { font-size: 22px; font-weight: 700; margin: 20px 0 8px; }
        .tiptap h3 { font-size: 18px; font-weight: 600; margin: 16px 0 6px; }
        .tiptap ul { list-style-type: disc; padding-left: 20px; margin: 8px 0; }
        .tiptap ol { list-style-type: decimal; padding-left: 20px; margin: 8px 0; }
        .tiptap li { margin-bottom: 4px; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #9ca3af; pointer-events: none; height: 0; }
        .tiptap hr { border: none; border-top: 2px solid #e5e7eb; margin: 20px 0; }
        .tiptap img[src=""], .tiptap img:not([src]) { display: block; width: 100%; height: 80px; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; cursor: pointer; }
        .tiptap img[src=""]::after, .tiptap img:not([src])::after { content: "Click to add image URL"; display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-size: 13px; }
      `}</style>

      {/* Image insert modal */}
      {imgModal.open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
          onClick={() => setImgModal(m => ({ ...m, open: false }))}
        >
          <div style={{
            background: "#fff", borderRadius: 14, padding: 24, width: 400,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0e1d4f", marginBottom: 16 }}>Insert Image</div>

            {/* URL field — pre-filled for uploads, editable for URL inserts */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>Image URL</label>
            <input
              type="url"
              autoFocus
              value={imgModal.url}
              onChange={(e) => setImgModal(m => ({ ...m, url: e.target.value }))}
              placeholder="https://…"
              style={{
                width: "100%", padding: "8px 11px", borderRadius: 8, fontSize: 14,
                border: "1.5px solid #d1d5db", outline: "none", boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            {/* Size presets */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 8 }}>Display Size</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {SIZE_PRESETS.map((p) => {
                const active = imgModal.size === p.value;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImgModal(m => ({ ...m, size: p.value }))}
                    style={{
                      flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: "1.5px solid",
                      borderColor: active ? "#0e1d4f" : "#d1d5db",
                      background: active ? "#0e1d4f" : "#fff",
                      color: active ? "#fff" : "#374151",
                      cursor: "pointer",
                    }}
                  >
                    {p.label}
                    {p.value && <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{p.value}</div>}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button"
                onClick={() => setImgModal(m => ({ ...m, open: false }))}
                style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button"
                onClick={insertImage}
                disabled={!imgModal.url.trim()}
                style={{
                  padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none",
                  background: imgModal.url.trim() ? "#0e1d4f" : "#e5e7eb",
                  color: imgModal.url.trim() ? "#fff" : "#9ca3af",
                  cursor: imgModal.url.trim() ? "pointer" : "default",
                }}>
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
