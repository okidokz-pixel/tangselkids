import { ClinicForm } from "@/components/admin/ClinicForm";
import { getSubmission, getDraft, getClinic } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Klinik" };

export default async function NewClinicPage({ searchParams }: { searchParams: Promise<{ from?: string; duplicate?: string; draft?: string }> }) {
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
    try { initial = submissionToListingInitial(await getSubmission(from), "clinic"); } catch {}
  } else if (duplicate) {
    try { initial = { ...(await getClinic(duplicate)), slug: "" }; } catch {}
  }
  return <ClinicForm initial={initial} initialDraftId={initialDraftId} />;
}
