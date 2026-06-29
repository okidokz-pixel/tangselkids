import { LearningCenterForm } from "@/components/admin/LearningCenterForm";
import { getSubmission } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Tempat Kursus" };

export default async function NewLearningCenterPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "learning-center"); } catch {}
  }
  return <LearningCenterForm initial={initial} />;
}
