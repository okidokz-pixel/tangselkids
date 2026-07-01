import { getDrafts } from "@/app/admin/actions";
import { DraftsList } from "./DraftsList";

export const metadata = { title: "Draf" };

export default async function DraftsPage() {
  const drafts = await getDrafts();

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div>
            <p className="eyebrow"><span className="num">—</span>TangselKids · Internal</p>
            <h1 className="page-title">Draf</h1>
            <div className="page-meta">
              <span className="txt">Listing yang disimpan tapi belum dipublikasikan.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <section className="section" style={{ paddingTop: 26 }}>
          <DraftsList drafts={drafts} />
        </section>
      </div>
    </>
  );
}
