import { DaycareForm } from "@/components/admin/DaycareForm";
import { getSubmission, getDraft, getDaycare } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Daycare" };

export default async function NewDaycarePage({ searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string; draft?: string }> }) {
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
    try { initial = submissionToListingInitial(await getSubmission(from), "daycare"); } catch {}
  } else if (duplicate) {
    try { initial = { ...(await getDaycare(duplicate)), slug: "" }; } catch {}
  }
  return <DaycareForm initial={initial} initialDraftId={initialDraftId} />;
}
