import { DaycareForm } from "@/components/admin/DaycareForm";
import { getSubmission } from "@/app/admin/actions";
import { submissionToListingInitial } from "@/lib/submissionToListing";

export const metadata = { title: "Tambah Daycare" };

export default async function NewDaycarePage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  let initial: Record<string, unknown> | undefined;
  if (from) {
    try { initial = submissionToListingInitial(await getSubmission(from), "daycare"); } catch {}
  }
  return <DaycareForm initial={initial} />;
}
