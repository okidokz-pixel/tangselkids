import { notFound } from "next/navigation";
import { getSubmission } from "../../actions";
import SubmissionDetail from "./SubmissionDetail";

export const metadata = { title: "Submission Detail" };

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let submission;
  try {
    submission = await getSubmission(id);
  } catch {
    notFound();
  }
  return <SubmissionDetail submission={submission} />;
}
