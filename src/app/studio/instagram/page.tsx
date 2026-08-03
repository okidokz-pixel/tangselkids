import type { Metadata } from "next";
import { ContentBank, type BankPost } from "../ContentBank";
import { IG_POSTS } from "../instagram-data";

export const metadata: Metadata = {
  title: "Instagram — Bank Konten TangselKids",
  robots: { index: false, follow: false },
};

function formatLabel(p: (typeof IG_POSTS)[number]): string {
  switch (p.format) {
    case "CAROUSEL": return `Carousel · ${p.media.filter((m) => m.type === "image").length} slide`;
    case "SINGLE":   return "Single post";
    case "REEL":     return "Reel — video";
    case "STORY":    return "Story — bikin manual di IG";
    default:         return p.format;
  }
}

const posts: BankPost[] = IG_POSTS.map((p) => ({
  format: formatLabel(p),
  title: p.title,
  blocks: p.caption ? [{ label: "Caption", text: p.caption, copyText: p.caption }] : [],
  brief: p.brief ?? undefined,
  media: p.media.map((m, i) => ({
    type: m.type,
    url: m.url,
    label: m.type === "video" ? "Video (Reel)" : `Slide ${i + 1}`,
  })),
}));

export default function InstagramBankPage() {
  return (
    <ContentBank
      posts={posts}
      storageKey="tk_ig_next_v1"
      platform="instagram"
      subtitle="Bank Konten Instagram · 28 postingan (4 minggu)"
      homeHref="/studio"
      doneNext="Tandai selesai & lanjut →"
    />
  );
}
