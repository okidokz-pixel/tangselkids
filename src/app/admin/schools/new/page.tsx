import { SchoolForm } from "@/components/admin/SchoolForm";
import { getSubmission, getSchool } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "New School" };

export default async function NewSchoolPage(
  { searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string }> },
) {
  const { from, duplicate } = await searchParams;
  let initial: Record<string, unknown> | undefined;

  if (from) {
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

  return <SchoolForm initial={initial} />;
}
