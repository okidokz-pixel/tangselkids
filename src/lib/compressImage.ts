/**
 * Client-side image compression for admin uploads.
 *
 * Downscales to a max long-edge and re-encodes to WebP before upload, so we
 * store small originals instead of full-size phone photos. This cuts Supabase
 * Storage usage and makes every on-the-fly transform cheaper.
 *
 * Falls back to the original file untouched when the browser can't process it
 * (SVG/GIF, decode failure, no WebP support) — never throws, never blocks an upload.
 */

export type CompressedImage = {
  blob: Blob;
  /** File extension to use for the stored object key, e.g. "webp" or original. */
  ext: string;
  contentType: string;
  /** Suggested filename (original basename + new ext). */
  filename: string;
};

type Options = {
  /** Longest edge in pixels. Larger images are scaled down to fit. */
  maxEdge?: number;
  /** WebP quality 0–1. */
  quality?: number;
};

const PROCESSABLE = /^image\/(jpeg|png|webp|bmp)$/i;

function originalResult(file: File): CompressedImage {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return { blob: file, ext, contentType: file.type || "application/octet-stream", filename: file.name };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = src;
  });
}

export async function compressImage(file: File, opts: Options = {}): Promise<CompressedImage> {
  const { maxEdge = 1600, quality = 0.82 } = opts;

  // Skip formats canvas can't reliably re-encode (SVG keeps vector; GIF may be animated).
  if (typeof document === "undefined" || !PROCESSABLE.test(file.type)) {
    return originalResult(file);
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const { width, height } = img;
    if (!width || !height) return originalResult(file);

    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return originalResult(file);
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );

    // Keep the original if WebP is unsupported or somehow came out bigger.
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) {
      return originalResult(file);
    }

    const base = file.name.replace(/\.[^.]+$/, "");
    return { blob, ext: "webp", contentType: "image/webp", filename: `${base}.webp` };
  } catch {
    return originalResult(file);
  } finally {
    URL.revokeObjectURL(url);
  }
}
