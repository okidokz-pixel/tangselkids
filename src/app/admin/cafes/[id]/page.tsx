import { getCafe } from "../../actions";
import { CafeForm } from "@/components/admin/CafeForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const cf = await getCafe(id);
    return { title: `Edit: ${cf.name}` };
  } catch {
    return { title: "Edit Kafe" };
  }
}

export default async function EditCafePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let cf;
  try {
    cf = await getCafe(id);
  } catch {
    notFound();
  }
  return <CafeForm initial={cf} id={id} />;
}
