import { getArticle } from "../../actions";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const article = await getArticle(id);
    return { title: `Edit: ${article.title}` };
  } catch {
    return { title: "Edit Article" };
  }
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let article;
  try {
    article = await getArticle(id);
  } catch {
    notFound();
  }
  return <ArticleForm initial={article} id={id} />;
}
