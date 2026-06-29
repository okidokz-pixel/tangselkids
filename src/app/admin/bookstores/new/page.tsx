import { BookstoreForm } from "@/components/admin/BookstoreForm";
import { getSubmission } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Toko Buku" };

export default async function NewBookstorePage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "bookstore"); } catch {}
  }
  return <BookstoreForm initial={initial} />;
}
