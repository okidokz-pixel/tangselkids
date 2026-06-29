import { SwimmingPoolForm } from "@/components/admin/SwimmingPoolForm";
import { getSubmission } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Kolam Renang" };

export default async function NewSwimmingPoolPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "swimming-pool"); } catch {}
  }
  return <SwimmingPoolForm initial={initial} />;
}
