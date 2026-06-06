import { getBookstore } from "../../actions";
import { BookstoreForm } from "@/components/admin/BookstoreForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const bs = await getBookstore(id);
    return { title: `Edit: ${bs.name}` };
  } catch {
    return { title: "Edit Toko Buku" };
  }
}

export default async function EditBookstorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let bs;
  try {
    bs = await getBookstore(id);
  } catch {
    notFound();
  }
  return <BookstoreForm initial={bs} id={id} />;
}
