import { PlaygroundForm } from "@/components/admin/PlaygroundForm";
import { getSubmission, getDraft, getPlayground } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Playground" };

export default async function NewPlaygroundPage({ searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string; draft?: string }> }) {
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
    try { initial = submissionToListingInitial(await getSubmission(from), "playground"); } catch {}
  } else if (duplicate) {
    try { initial = { ...(await getPlayground(duplicate)), slug: "" }; } catch {}
  }
  return <PlaygroundForm initial={initial} initialDraftId={initialDraftId} />;
}
