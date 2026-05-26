import { getSchool } from "../../actions";
import { SchoolForm } from "@/components/admin/SchoolForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const school = await getSchool(id);
    return { title: `Edit: ${school.name}` };
  } catch {
    return { title: "Edit School" };
  }
}

export default async function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let school;
  try {
    school = await getSchool(id);
  } catch {
    notFound();
  }
  return <SchoolForm initial={school} id={id} />;
}
