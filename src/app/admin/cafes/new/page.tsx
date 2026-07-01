import { CafeForm } from "@/components/admin/CafeForm";
import { getSubmission, getDraft } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Kafe" };

export default async function NewCafePage({ searchParams }: { searchParams: Promise<{ from?: string; draft?: string }> }) {
  const { from, draft } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  let initialDraftId: string | undefined;
  if (draft) {
    try {
      const d = await getDraft(draft);
      initial = (d.payload ?? undefined) as Record<string, unknown> | undefined;
      initialDraftId = d.id as string;
    } catch {}
  } else if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "cafe"); } catch {}
  }
  return <CafeForm initial={initial} initialDraftId={initialDraftId} />;
}
