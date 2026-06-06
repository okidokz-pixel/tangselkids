import { getClinic } from "../../actions";
import { ClinicForm } from "@/components/admin/ClinicForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const cl = await getClinic(id);
    return { title: `Edit: ${cl.name}` };
  } catch {
    return { title: "Edit Klinik" };
  }
}

export default async function EditClinicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let cl;
  try {
    cl = await getClinic(id);
  } catch {
    notFound();
  }
  return <ClinicForm initial={cl} id={id} />;
}
