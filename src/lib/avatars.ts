export const PREMADE_AVATARS = [
  { id: "avatar_0", emoji: "🦊", bg: "#FEF3C7" },
  { id: "avatar_1", emoji: "🐼", bg: "#F0FDF4" },
  { id: "avatar_2", emoji: "🐨", bg: "#DBEAFE" },
  { id: "avatar_3", emoji: "🦁", bg: "#FEF9C3" },
  { id: "avatar_4", emoji: "🐸", bg: "#D1FAE5" },
  { id: "avatar_5", emoji: "🦋", bg: "#EDE9FE" },
  { id: "avatar_6", emoji: "🌸", bg: "#FFE4E6" },
  { id: "avatar_7", emoji: "🌟", bg: "#FFF7ED" },
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

/** Resize an image File to a 120×120 JPEG data URL (for localStorage storage) */
export function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const size = 120;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        // Crop to square from centre
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
