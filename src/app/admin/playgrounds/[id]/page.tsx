import { getPlayground } from "../../actions";
import { PlaygroundForm } from "@/components/admin/PlaygroundForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const pg = await getPlayground(id);
    return { title: `Edit: ${pg.name}` };
  } catch {
    return { title: "Edit Playground" };
  }
}

export default async function EditPlaygroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let pg;
  try {
    pg = await getPlayground(id);
  } catch {
    notFound();
  }
  return <PlaygroundForm initial={pg} id={id} />;
}
