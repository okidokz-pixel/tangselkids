import { MiniZooForm } from "@/components/admin/MiniZooForm";
import { getSubmission } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Animal Encounter" };

export default async function NewMiniZooPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "mini-zoo"); } catch {}
  }
  return <MiniZooForm initial={initial} />;
}
