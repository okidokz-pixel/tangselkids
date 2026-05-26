import { getLearningCenter } from "../../actions";
import { LearningCenterForm } from "@/components/admin/LearningCenterForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const lc = await getLearningCenter(id);
    return { title: `Edit: ${lc.name}` };
  } catch {
    return { title: "Edit Tempat Kursus" };
  }
}

export default async function EditLearningCenterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let lc;
  try {
    lc = await getLearningCenter(id);
  } catch {
    notFound();
  }
  return <LearningCenterForm initial={lc} id={id} />;
}
