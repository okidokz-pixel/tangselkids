import { SwimmingPoolForm } from "@/components/admin/SwimmingPoolForm";
import { getSubmission, getDraft, getSwimmingPool } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Kolam Renang" };

export default async function NewSwimmingPoolPage({ searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string; draft?: string }> }) {
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
    try { initial = submissionToListingInitial(await getSubmission(from), "swimming-pool"); } catch {}
  } else if (duplicate) {
    try { initial = { ...(await getSwimmingPool(duplicate)), slug: "" }; } catch {}
  }
  return <SwimmingPoolForm initial={initial} initialDraftId={initialDraftId} />;
}
