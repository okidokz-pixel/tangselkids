import { BookstoreForm } from "@/components/admin/BookstoreForm";
import { getSubmission, getDraft, getBookstore } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Toko Buku" };

export default async function NewBookstorePage({ searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string; draft?: string }> }) {
  const { from, duplicate, draft } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  let initialDraftId: string | undefined;
  if (draft) {
    try {
      const d = await getDraft(draft);
      initial = (d.payload ?? undefined) as Record<string, unknown> | undefined;
      initialDraftId = d.id as string;
    } catch {}
  } else if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "bookstore"); } catch {}
  } else if (duplicate) {
    try { initial = { ...(await getBookstore(duplicate)), slug: "" }; } catch {}
  }
  return <BookstoreForm initial={initial} initialDraftId={initialDraftId} />;
}
