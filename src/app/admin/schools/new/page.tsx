import { SchoolForm } from "@/components/admin/SchoolForm";
import { getSubmission, getSchool, getDraft } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "New School" };

export default async function NewSchoolPage(
  { searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string; draft?: string }> },
) {
  const { from, duplicate, draft } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  let initialDraftId: string | undefined;

  if (draft) {
    // Resume a saved draft: feed its stored payload straight back as the form's initial.
    try {
      const d = await getDraft(draft);
      initial = (d.payload ?? undefined) as Record<string, unknown> | undefined;
      initialDraftId = d.id as string;
    } catch {}
  } else if (from) {
    // Pre-fill from an approved submission.
    try { initial = submissionToListingInitial(await getSubmission(from), "school"); } catch {}
  } else if (duplicate) {
    // Duplicate an existing listing: copy everything but the slug, and create a
    // new record (no id) so the admin can tweak jenjang and save a fresh page.
    try {
      const sch = await getSchool(duplicate);
      initial = { ...sch, slug: "" };
    } catch {}
  }

  return <SchoolForm initial={initial} initialDraftId={initialDraftId} />;
}
