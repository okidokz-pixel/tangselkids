import type { Metadata } from "next";
import { ContentBank, type BankPost } from "../ContentBank";
import { THREAD_POSTS } from "../threads-data";

export const metadata: Metadata = {
  title: "Threads — Bank Konten TangselKids",
  robots: { index: false, follow: false },
};

const posts: BankPost[] = THREAD_POSTS.map((p) => {
  const isThread = p.parts.length > 1;
  return {
    format: p.format === "Single"
      ? "Postingan tunggal"
      : p.format.replace("Thread —", "Utas —").replace("parts", "bagian").replace("part", "bagian"),
    threadHint: isThread,
    blocks: p.parts.map((text, i) => ({
      label: isThread ? `Bagian ${i + 1} / ${p.parts.length}` : "Postingan",
      text,
      copyText: i === 0 && p.hashtags ? `${text}\n\n${p.hashtags}` : text,
      hashtags: i === 0 && p.hashtags ? p.hashtags : undefined,
    })),
  };
});

export default function ThreadsBankPage() {
  return (
    <ContentBank
      posts={posts}
      storageKey="tk_threads_next_v2"
      brand="Threads"
      subtitle="Bank Konten Threads · 30 postingan"
      homeHref="/studio"
      doneNext="Tandai selesai & lanjut →"
    />
  );
}
