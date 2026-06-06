import { getDaycare } from "../../actions";
import { DaycareForm } from "@/components/admin/DaycareForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const dc = await getDaycare(id);
    return { title: `Edit: ${dc.name}` };
  } catch {
    return { title: "Edit Daycare" };
  }
}

export default async function EditDaycarePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let dc;
  try {
    dc = await getDaycare(id);
  } catch {
    notFound();
  }
  return <DaycareForm initial={dc} id={id} />;
}
