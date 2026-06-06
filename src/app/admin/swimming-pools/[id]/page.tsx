import { getSwimmingPool } from "../../actions";
import { SwimmingPoolForm } from "@/components/admin/SwimmingPoolForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const sp = await getSwimmingPool(id);
    return { title: `Edit: ${sp.name}` };
  } catch {
    return { title: "Edit Kolam Renang" };
  }
}

export default async function EditSwimmingPoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let sp;
  try {
    sp = await getSwimmingPool(id);
  } catch {
    notFound();
  }
  return <SwimmingPoolForm initial={sp} id={id} />;
}
