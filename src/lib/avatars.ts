export const PREMADE_AVATARS = [
  { id: "avatar_0", emoji: "👨", bg: "#DBEAFE" },
  { id: "avatar_1", emoji: "👩", bg: "#FCE7F3" },
  { id: "avatar_2", emoji: "👴", bg: "#F0FDF4" },
  { id: "avatar_3", emoji: "👵", bg: "#FEF3C7" },
  { id: "avatar_4", emoji: "🧔", bg: "#FEF9C3" },
  { id: "avatar_5", emoji: "👱‍♀️", bg: "#FFF7ED" },
] as const;

export type AvatarId = typeof PREMADE_AVATARS[number]["id"];

/** Parse a stored avatar string into display info */
export function getAvatarMeta(avatar?: string):
  | { type: "emoji"; emoji: string; bg: string }
  | { type: "photo"; src: string }
  | null {
  if (!avatar) return null;
  if (avatar.startsWith("data:")) return { type: "photo", src: avatar };
  const found = PREMADE_AVATARS.find((a) => a.id === avatar);
  if (found) return { type: "emoji", emoji: found.emoji, bg: found.bg };
  return null;
}

/**
 * Resize an image File to a data URL.
 * @param file - The image file
 * @param maxSize - Max width/height in px (default 120). When > 120, aspect ratio is preserved (no square crop).
 */
export function resizeImageToDataUrl(file: File, maxSize = 120): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        if (maxSize <= 120) {
          // Square crop (original behaviour for avatar thumbnails)
          const size = maxSize;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d")!;
          const min = Math.min(img.width, img.height);
          const sx = (img.width - min) / 2;
          const sy = (img.height - min) / 2;
          ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        } else {
          // Preserve aspect ratio — just cap the longest side
          const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width  = Math.round(img.width  * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
