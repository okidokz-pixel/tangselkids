import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The 29 July Viral Moment — TangselKids",
  description: "The day a single mother's post sent 2,900 parents to TangselKids at once. A record of July 29, 2026.",
  robots: { index: false, follow: false },
};

// ── palette ──────────────────────────────────────────────────────────────────
const C = {
  paper:    "#f7f4ec",
  card:     "#ffffff",
  ink:      "#132339",
  muted:    "#5d6b7b",
  faint:    "#8a97a5",
  line:     "#e7e1d4",
  green:    "#2e8a5a",
  greenDk:  "#1f6b43",
  greenDeep:"#0a2018",
  amber:    "#b9791b",
  amberBg:  "#f7edd6",
  rose:     "#c0405a",
};
const serif = "var(--font-fraunces), Georgia, serif";
const sans  = "var(--font-jakarta), system-ui, sans-serif";

// hourly visitors, midnight → 11pm (July 29, 2026)
const HOURS = [33,28,20,12,22,80,168,212,306,303,276,276,211,202,251,198,177,83,22,12,14,12,5,4];
const HMAX = 306;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 800, letterSpacing: "0.18em",
      textTransform: "uppercase", color: C.green, marginBottom: 10 }}>
      {children}
    </div>
  );
}
function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: serif, fontSize: 25, fontWeight: 700, color: C.ink,
      margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
      {children}
    </h2>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: sans, fontSize: 15.5, lineHeight: 1.72, color: "#2c3a4a", margin: "0 0 16px" }}>
      {children}
    </p>
  );
}
const sectionStyle: React.CSSProperties = { padding: "34px 22px", borderTop: `1px solid ${C.line}` };

export default function ViralMomentPage() {
  return (
    <div style={{ background: C.paper, minHeight: "100vh" }}>
      <article style={{ maxWidth: 640, margin: "0 auto", background: C.paper }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <header style={{
          background: `linear-gradient(160deg, ${C.greenDeep} 0%, ${C.greenDk} 58%, ${C.green} 100%)`,
          padding: "64px 24px 52px", color: "#fff",
        }}>
          <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
            TangselKids · A Record
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 40, fontWeight: 700, lineHeight: 1.08,
            letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            The Day TangselKids Went Viral
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15.5, lineHeight: 1.6, color: "rgba(255,255,255,0.82)", margin: 0 }}>
            The day a single mother&rsquo;s post sent nearly three thousand parents
            to our doorstep at once — and everything we learned when they arrived.
          </p>
          <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.7)", margin: "22px 0 0" }}>
            July 29, 2026
          </p>
        </header>

        {/* ── I. The calm before ───────────────────────────────────────── */}
        <section style={{ ...sectionStyle, borderTop: "none" }}>
          <Eyebrow>Chapter I · The calm before</Eyebrow>
          <P>
            For most of July, TangselKids hummed along the way a young directory does —
            a few hundred parents a day, arriving mostly from Google, quietly browsing
            schools in Bintaro and BSD. On an ordinary day, fifteen to forty of them
            would sign up.
          </P>
          <P>
            The database held <b>617 places</b> — 317 in BSD, 234 in Bintaro, 66 across
            the rest of Tangerang — each one checked by hand: curriculum, fees,
            facilities, enrollment dates. Nothing about July 28 suggested that July 29
            would be different.
          </P>
        </section>

        {/* ── II. The morning it exploded + bar chart ──────────────────── */}
        <section style={sectionStyle}>
          <Eyebrow>Chapter II · 5 A.M., the ground shakes</Eyebrow>
          <H2>The city wakes early — and so did the flood</H2>
          <P>
            After Subuh, phones light up across Tangsel. On this morning, something was
            already moving through them. By 8 A.M. the site was serving over{" "}
            <b>300 visitors an hour</b>. In that single peak hour, the app fired{" "}
            <b>75,652 requests</b> at the database. This was not a trickle.
          </P>

          {/* bar chart */}
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18,
            padding: "20px 18px 14px", boxShadow: "0 4px 16px rgba(19,35,60,0.05)", margin: "22px 0 6px" }}>
            <div style={{ fontFamily: sans, fontSize: 11.5, fontWeight: 700, color: C.muted,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
              Visitors per hour · July 29
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 132 }}>
              {HOURS.map((v, i) => {
                const peak = i === 8 || i === 9;
                const cliff = i >= 18;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
                    justifyContent: "flex-end", height: "100%" }}>
                    <div style={{
                      height: `${Math.max((v / HMAX) * 100, 2)}%`,
                      borderRadius: "3px 3px 0 0",
                      background: peak ? C.green : cliff ? "#d9b48a" : "#a7d3bd",
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8,
              fontFamily: sans, fontSize: 10.5, color: C.faint, fontVariantNumeric: "tabular-nums" }}>
              <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
            </div>
            <p style={{ fontFamily: sans, fontSize: 12.5, color: C.muted, margin: "12px 0 0", lineHeight: 1.5 }}>
              A quiet night, a tremor at 5&nbsp;A.M., the <b style={{ color: C.green }}>peak at 8–9&nbsp;A.M.</b>,
              a full day of steady traffic — and then <b style={{ color: C.amber }}>the 6&nbsp;P.M. cliff</b> (Chapter&nbsp;VI).
            </p>
          </div>
        </section>

        {/* ── the headline numbers ─────────────────────────────────────── */}
        <section style={sectionStyle}>
          <Eyebrow>When the dust settled</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["~2,900", "visitors in one day"],
              ["22,053", "pages read"],
              ["786", "searches run"],
              ["98%", "from Indonesia"],
            ].map(([n, l]) => (
              <div key={l} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16,
                padding: "18px 16px", boxShadow: "0 4px 16px rgba(19,35,60,0.05)" }}>
                <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 700, color: C.ink,
                  letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{n}</div>
                <div style={{ fontFamily: sans, fontSize: 12.5, color: C.muted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 15, color: C.muted, margin: "20px 0 0", textAlign: "center" }}>
            For a hyperlocal parenting directory, a once-in-a-lifetime day.
          </p>
        </section>

        {/* ── III. The mystery ─────────────────────────────────────────── */}
        <section style={sectionStyle}>
          <Eyebrow>Chapter III · The mystery</Eyebrow>
          <H2>&ldquo;But I didn&rsquo;t post anything.&rdquo;</H2>
          <P>
            It came from nowhere the founder could see. No campaign, no ad, no spike in
            the TangselKids accounts. The first clue: <b>74% of visitors landed on the
            homepage</b> — not a single school. The <i>whole app</i> had been recommended.
            The second clue was in the referrers.
          </P>
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden",
            boxShadow: "0 4px 16px rgba(19,35,60,0.05)" }}>
            {[
              ["Direct", "1,118", "typed the address, or forwarded it"],
              ["Threads (l.threads.com)", "1,006", "clicks from inside a Threads post"],
              ["Google", "547", "searched the name"],
              ["Instagram", "~58", "a small echo"],
            ].map(([src, n, note], idx) => (
              <div key={src} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "13px 16px",
                borderTop: idx ? `1px solid ${C.line}` : "none" }}>
                <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: C.green,
                  minWidth: 62, fontVariantNumeric: "tabular-nums" }}>{n}</div>
                <div>
                  <div style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 700, color: C.ink }}>{src}</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: C.faint }}>{note}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.7, color: "#2c3a4a", margin: "18px 0 0" }}>
            Threads. Someone had posted about TangselKids — and it wasn&rsquo;t the founder.
            It was a stranger.
          </p>
        </section>

        {/* ── IV. Finding her — the centerpiece ────────────────────────── */}
        <section style={{ ...sectionStyle, background: "#fbf9f3" }}>
          <Eyebrow>Chapter IV · Finding her</Eyebrow>
          <H2>Her name was @shabila1217</H2>
          <P>
            Three days earlier she had posted a screenshot of the TangselKids homepage —
            the green logo, the search bar, &ldquo;617&nbsp;tempat&rdquo; — with a caption
            written in the easy voice of someone telling a friend:
          </P>

          <blockquote style={{ margin: "8px 0 20px", padding: "22px 22px", background: C.card,
            borderLeft: `4px solid ${C.green}`, borderRadius: "4px 14px 14px 4px",
            boxShadow: "0 4px 16px rgba(19,35,60,0.06)" }}>
            <p style={{ fontFamily: serif, fontSize: 18, fontStyle: "italic", lineHeight: 1.5,
              color: C.ink, margin: "0 0 10px" }}>
              &ldquo;Kemana aja aku ternyata ada web buat cari sekolah anak di tangsel 😍
              lengkap bangettt sama biaya biaya nya.&rdquo;
            </p>
            <p style={{ fontFamily: sans, fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.55 }}>
              &ldquo;Where have I been — turns out there&rsquo;s a website for finding kids&rsquo;
              schools in Tangsel 😍 so complete, with all the fees too.&rdquo;
            </p>
          </blockquote>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
            {[["1.8K", "likes"], ["1.5K", "shares"], ["251", "reposts"], ["119", "replies"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center", background: C.card, border: `1px solid ${C.line}`,
                borderRadius: 12, padding: "12px 4px" }}>
                <div style={{ fontFamily: serif, fontSize: 21, fontWeight: 700, color: C.ink,
                  fontVariantNumeric: "tabular-nums" }}>{n}</div>
                <div style={{ fontFamily: sans, fontSize: 10.5, color: C.muted, textTransform: "uppercase",
                  letterSpacing: "0.05em" }}>{l}</div>
              </div>
            ))}
          </div>

          <P>
            She hadn&rsquo;t even posted a clickable link — just a screenshot with the
            address <b>tangselkids.com</b> visible at the bottom. That one detail explained
            everything: the people who read the URL and <b>typed it</b> became the Direct
            traffic; the ones who <b>Googled it</b> became the Organic traffic; and the
            address written as text on Threads became the referral traffic.
          </P>
          <P>
            One authentic post. Two thousand nine hundred parents. People found it useful,
            and they told each other. That is the whole story of the traffic — and it is a
            quietly beautiful one.
          </P>
        </section>

        {/* ── V. The cruel twist ───────────────────────────────────────── */}
        <section style={sectionStyle}>
          <Eyebrow>Chapter V · The cruel twist</Eyebrow>
          <H2>On the biggest day, nobody could get in</H2>
          <P>
            Here the triumph turns. On the busiest day in TangselKids&rsquo; history —
            thousands of interested parents, hundreds ready to sign up — the number of
            completed registrations was <b>zero</b>.
          </P>
          <P>
            The forensics were clear. That day, <b>2,628 people tried to request a
            verification code.</b> They tapped &ldquo;Kirim Kode.&rdquo; They wanted in.
            And this is what happened to them:
          </P>
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden",
            boxShadow: "0 4px 16px rgba(19,35,60,0.05)" }}>
            {[
              ["Blocked — rate limit", "1,890", "72%", C.rose],
              ["Rejected (bad number)", "363", "14%", C.faint],
              ["Actually sent", "358", "14%", C.green],
              ["Server error", "17", "—", C.faint],
            ].map(([label, n, pct, col], idx) => (
              <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                borderTop: idx ? `1px solid ${C.line}` : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: col as string, flexShrink: 0 }} />
                <div style={{ fontFamily: sans, fontSize: 13.5, color: C.ink, flex: 1 }}>{label}</div>
                <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: C.ink,
                  fontVariantNumeric: "tabular-nums" }}>{n}</div>
                <div style={{ fontFamily: sans, fontSize: 12, color: C.muted, minWidth: 34, textAlign: "right" }}>{pct}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.7, color: "#2c3a4a", margin: "18px 0 0" }}>
            A hidden ceiling of just <b>30 codes per hour</b> for the entire site slammed
            shut in the first hour and turned away nearly three of every four parents who
            tried. And the few who slipped through met a second wall: the WhatsApp delivery
            channel had quietly broken days earlier. Even a code marked &ldquo;sent&rdquo;
            never arrived.
          </p>
        </section>

        {/* ── VI. The pause ────────────────────────────────────────────── */}
        <section style={{ ...sectionStyle, background: C.amberBg, borderTop: `1px solid ${C.line}` }}>
          <Eyebrow>Chapter VI · And then the lights went out</Eyebrow>
          <P>
            As if to underline the point, the viral traffic did one more thing: it
            overwhelmed the hosting plan. Around <b>6 P.M.</b>, having blown far past the
            free tier&rsquo;s request limit, the site was <b>paused</b>. That is the cliff
            in the chart — pageviews collapsing from 362 to 17 in a single hour.
          </P>
          <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.5,
            color: C.amber, margin: 0 }}>
            A viral post had arrived, filled the house with guests — and the doors were
            locked, and then the lights went out.
          </p>
        </section>

        {/* ── VII. The turnaround ──────────────────────────────────────── */}
        <section style={sectionStyle}>
          <Eyebrow>Chapter VII · The turnaround</Eyebrow>
          <H2>The rebuild</H2>
          <P>The days that followed were a reckoning, and then a rebuild:</P>
          <ul style={{ margin: "0 0 18px", padding: 0, listStyle: "none", display: "flex",
            flexDirection: "column", gap: 10 }}>
            {[
              "The hosting was upgraded so the site could take the weight.",
              "The verification ceiling was raised from 30 codes/hour to 500 — a sixteenfold increase.",
              "The broken OTP provider was replaced entirely, proven end-to-end in production.",
              "The whole registration funnel was made ready for the next wave.",
            ].map((t) => (
              <li key={t} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <span style={{ color: C.green, fontWeight: 800, fontFamily: sans, fontSize: 15, lineHeight: 1.6 }}>✓</span>
                <span style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.65, color: "#2c3a4a" }}>{t}</span>
              </li>
            ))}
          </ul>
          <div style={{ background: `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`, borderRadius: 16,
            padding: "20px 22px", color: "#fff" }}>
            <p style={{ fontFamily: sans, fontSize: 14.5, lineHeight: 1.6, margin: 0, color: "rgba(255,255,255,0.92)" }}>
              The proof came quickly: after the fix, TangselKids booked{" "}
              <b>20 new signups in six hours</b> — from a standing start of zero. The doors
              were open again.
            </p>
          </div>
        </section>

        {/* ── VIII. What it taught ─────────────────────────────────────── */}
        <section style={sectionStyle}>
          <Eyebrow>Chapter VIII · What July 29 taught</Eyebrow>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["The product is real.", "No ad spend, no growth hack — a single parent decided it was worth telling everyone she knew. That is the strongest signal a young product can get."],
              ["Word of mouth travels on screenshots.", "She didn't even share a link, and still sent 2,900 people. The name was short enough to type, and worth typing."],
              ["A viral moment is only as good as the front door.", "The traffic was a gift; the locked registration wall was the lesson. The next post will find a site that can let people in."],
              ["Watch the humble numbers.", "The whole mystery was solved by reading the data — the hourly curve, the landing pages, the referrers, the status codes. The story was always in there."],
            ].map(([h, b], i) => (
              <li key={h} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, color: C.line, lineHeight: 1,
                  minWidth: 30, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                <div>
                  <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 800, color: C.ink, marginBottom: 3 }}>{h}</div>
                  <div style={{ fontFamily: sans, fontSize: 14.5, lineHeight: 1.6, color: C.muted }}>{b}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── closing ──────────────────────────────────────────────────── */}
        <section style={{ padding: "44px 24px 40px", background: C.greenDeep, textAlign: "center" }}>
          <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 18, lineHeight: 1.6,
            color: "rgba(255,255,255,0.9)", margin: "0 0 24px", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            One ordinary Tuesday, a mother in Tangsel typed a sentence about a website she
            liked. By nightfall, three thousand parents had come to see. TangselKids will
            have bigger days — but it will only ever have one first one.
          </p>
          <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 26 }}>
            July 29, 2026
          </div>
          <Link href="/" style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 700, color: C.greenDeep,
            background: "#fff", padding: "11px 22px", borderRadius: 999, textDecoration: "none",
            display: "inline-block" }}>
            ← Kembali ke TangselKids
          </Link>
        </section>

      </article>
    </div>
  );
}
