import { MiniZooForm } from "@/components/admin/MiniZooForm";
import { getSubmission, getDraft, getMiniZoo } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Animal Encounter" };

export default async function NewMiniZooPage({ searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string; draft?: string }> }) {
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
    try { initial = submissionToListingInitial(await getSubmission(from), "mini-zoo"); } catch {}
  } else if (duplicate) {
    try { initial = { ...(await getMiniZoo(duplicate)), slug: "" }; } catch {}
  }
  return <MiniZooForm initial={initial} initialDraftId={initialDraftId} />;
}
