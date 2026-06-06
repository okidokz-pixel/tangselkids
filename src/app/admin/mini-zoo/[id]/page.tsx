import { getMiniZoo } from "../../actions";
import { MiniZooForm } from "@/components/admin/MiniZooForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const mz = await getMiniZoo(id);
    return { title: `Edit: ${mz.name}` };
  } catch {
    return { title: "Edit Animal Encounter" };
  }
}

export default async function EditMiniZooPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let mz;
  try {
    mz = await getMiniZoo(id);
  } catch {
    notFound();
  }
  return <MiniZooForm initial={mz} id={id} />;
}
