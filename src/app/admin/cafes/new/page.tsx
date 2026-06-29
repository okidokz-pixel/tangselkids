import { CafeForm } from "@/components/admin/CafeForm";
import { getSubmission } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Kafe" };

export default async function NewCafePage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "cafe"); } catch {}
  }
  return <CafeForm initial={initial} />;
}
