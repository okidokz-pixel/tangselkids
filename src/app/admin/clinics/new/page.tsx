import { ClinicForm } from "@/components/admin/ClinicForm";
import { getSubmission, getDraft } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Klinik" };

export default async function NewClinicPage({ searchParams }: { searchParams: Promise<{ from?: string; draft?: string }> }) {
  const { from, draft } = await searchParams;
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
  }
  return <ClinicForm initial={initial} initialDraftId={initialDraftId} />;
}
