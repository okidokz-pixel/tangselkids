import { ClinicForm } from "@/components/admin/ClinicForm";
import { getSubmission } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Klinik" };

export default async function NewClinicPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "clinic"); } catch {}
  }
  return <ClinicForm initial={initial} />;
}
