import { SchoolForm } from "@/components/admin/SchoolForm";
import { getSubmission } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "New School" };

export default async function NewSchoolPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "school"); } catch {}
  }
  return <SchoolForm initial={initial} />;
}
