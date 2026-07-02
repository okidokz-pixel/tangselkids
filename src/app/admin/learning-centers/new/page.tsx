import { LearningCenterForm } from "@/components/admin/LearningCenterForm";
import { getSubmission, getDraft, getLearningCenter } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Tempat Kursus" };

export default async function NewLearningCenterPage({ searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string; draft?: string }> }) {
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
    try { initial = submissionToListingInitial(await getSubmission(from), "learning-center"); } catch {}
  } else if (duplicate) {
    try { initial = { ...(await getLearningCenter(duplicate)), slug: "" }; } catch {}
  }
  return <LearningCenterForm initial={initial} initialDraftId={initialDraftId} />;
}
