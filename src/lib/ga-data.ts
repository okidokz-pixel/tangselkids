import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { unstable_cache } from "next/cache";

function getClient() {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  });
}

const PROPERTY = `properties/${process.env.GA_PROPERTY_ID}`;

export type DailyPoint = { date: string; pageviews: number; users: number };

export type EngagementStats = {
  avgDuration: number;     // seconds
  pagesPerSession: number;
  bounceRate: number;      // 0–1
  returnRate: number;      // 0–1
};

export type GaStats = {
  activeUsers: number;
  today: { users: number; sessions: number; pageviews: number };
  yesterday: { users: number; sessions: number; pageviews: number };
  week: { users: number; sessions: number; pageviews: number };
  prevWeek: { users: number; sessions: number; pageviews: number };
  month: { users: number; sessions: number; pageviews: number };
  prevMonth: { users: number; sessions: number; pageviews: number };
  allTime: { users: number; sessions: number; pageviews: number };
  topPages: { path: string; views: number }[];
  topPlaces: { path: string; title: string; views: number }[];
  topSearchTerms: { term: string; count: number }[];
  noResultsTerms: { term: string; count: number }[];
  registrationFunnel: { event: string; count: number }[];
  topSources: { source: string; sessions: number }[];
  deviceBreakdown: { device: string; sessions: number }[];
  countryBreakdown: { country: string; sessions: number }[];
  dailyData: DailyPoint[];
  dailyDataAll: DailyPoint[];
  engagement: EngagementStats;
  prevEngagement: EngagementStats;
  weekdayDurations: { day: number; avgDuration: number }[];
};

// Everything that responds to the period selector on the analytics page.
export type RangeStats = {
  kpi: { users: number; sessions: number; pageviews: number };
  prevKpi: { users: number; sessions: number; pageviews: number } | null;
  dailyData: DailyPoint[];
  engagement: EngagementStats;
  prevEngagement: EngagementStats | null;
  weekdayDurations: { day: number; avgDuration: number }[];
  topPages: { path: string; views: number }[];
  topSources: { source: string; sessions: number }[];
  deviceBreakdown: { device: string; sessions: number }[];
  countryBreakdown: { country: string; sessions: number }[];
  topPlaces: { path: string; title: string; views: number }[];
  topSearchTerms: { term: string; count: number }[];
  noResultsTerms: { term: string; count: number }[];
  registrationFunnel: { event: string; count: number }[];
};

export const FUNNEL_LABELS: Record<string, string> = {
  begin_registration:        "Mulai Daftar (kirim OTP)",
  registration_otp_verified: "OTP Terverifikasi",
  sign_up:                   "Registrasi Selesai",
  login_start:               "Mulai Login (kirim OTP)",
  login:                     "Login Berhasil",
};
export const FUNNEL_ORDER = ["begin_registration", "registration_otp_verified", "sign_up", "login_start", "login"];

// Combined KPI + engagement metrics (single report, parsed by index)
const KPI_ENG_METRICS = [
  { name: "activeUsers" },                // 0
  { name: "sessions" },                   // 1
  { name: "screenPageViews" },            // 2
  { name: "averageSessionDuration" },     // 3
  { name: "screenPageViewsPerSession" },  // 4
  { name: "bounceRate" },                 // 5
  { name: "totalUsers" },                 // 6
  { name: "newUsers" },                   // 7
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseKpiCombined(res: any) {
  const row = res?.[0]?.rows?.[0];
  const v = (i: number) => Number(row?.metricValues?.[i]?.value ?? 0);
  return { users: v(0), sessions: v(1), pageviews: v(2) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEngCombined(res: any): EngagementStats {
  const row = res?.[0]?.rows?.[0];
  const v = (i: number) => Number(row?.metricValues?.[i]?.value ?? 0);
  const totalUsers = v(6), newUsers = v(7);
  return {
    avgDuration: v(3),
    pagesPerSession: v(4),
    bounceRate: v(5),
    returnRate: totalUsers > 0 ? (totalUsers - newUsers) / totalUsers : 0,
  };
}
function cleanTitle(s: string | undefined) {
  return (s ?? "").replace(/\s*[|·—-]\s*.*$/, "").trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEngagement(res: any): EngagementStats {
  const row = res[0]?.rows?.[0];
  const v = (i: number) => Number(row?.metricValues?.[i]?.value ?? 0);
  const totalUsers = v(3);
  const newUsers = v(4);
  return {
    avgDuration: v(0),
    pagesPerSession: v(1),
    bounceRate: v(2),
    returnRate: totalUsers > 0 ? (totalUsers - newUsers) / totalUsers : 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowVal(row: any, index = 0): number {
  return Number(row?.metricValues?.[index]?.value ?? 0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSingle(res: any) {
  const row = res[0]?.rows?.[0];
  return {
    users: rowVal(row, 0),
    sessions: rowVal(row, 1),
    pageviews: rowVal(row, 2),
  };
}

async function fetchGaStats(): Promise<GaStats> {
  const client = getClient();

  const engagementMetrics = [
    { name: "averageSessionDuration" },
    { name: "screenPageViewsPerSession" },
    { name: "bounceRate" },
    { name: "totalUsers" },
    { name: "newUsers" },
  ];

  const [
    realtimeRes, todayRes, yesterdayRes, weekRes, prevWeekRes,
    monthRes, prevMonthRes, allTimeRes, pagesRes, sourcesRes,
    devicesRes, countriesRes, dailyRes, dailyAllRes,
    engagementRes, prevEngagementRes, weekdayRes,
    searchTermsRes, noResultsRes, funnelRes, topPlacesRes,
  ] = await Promise.all([
    client.runRealtimeReport({
      property: PROPERTY,
      metrics: [{ name: "activeUsers" }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "today", endDate: "today" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "14daysAgo", endDate: "8daysAgo" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "60daysAgo", endDate: "31daysAgo" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "2024-01-01", endDate: "today" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 15,
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "2024-01-01", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: engagementMetrics,
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "60daysAgo", endDate: "31daysAgo" }],
      metrics: engagementMetrics,
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "dayOfWeek" }],
      metrics: [{ name: "averageSessionDuration" }],
      orderBys: [{ dimension: { dimensionName: "dayOfWeek" } }],
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "searchTerm" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "search" } } },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "searchTerm" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "search_no_results" } } },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: { values: ["begin_registration", "registration_otp_verified", "sign_up", "login_start", "login"] },
        },
      },
    }),
    client.runReport({
      property: PROPERTY,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/place/" },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
  ]);

  const activeUsers = Number(realtimeRes[0].rows?.[0]?.metricValues?.[0]?.value ?? 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topPages = ((pagesRes[0].rows ?? []) as any[]).map((r) => ({
    path: r.dimensionValues?.[0]?.value ?? "/",
    views: rowVal(r),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topSources = ((sourcesRes[0].rows ?? []) as any[]).map((r) => ({
    source: r.dimensionValues?.[0]?.value ?? "(direct)",
    sessions: rowVal(r),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deviceBreakdown = ((devicesRes[0].rows ?? []) as any[]).map((r) => ({
    device: r.dimensionValues?.[0]?.value ?? "unknown",
    sessions: rowVal(r),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countryBreakdown = ((countriesRes[0].rows ?? []) as any[]).map((r) => ({
    country: r.dimensionValues?.[0]?.value ?? "Unknown",
    sessions: rowVal(r),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyData: DailyPoint[] = ((dailyRes[0].rows ?? []) as any[]).map((r) => {
    const raw = r.dimensionValues?.[0]?.value ?? "20000101";
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    return { date, pageviews: rowVal(r, 0), users: rowVal(r, 1) };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyDataAll: DailyPoint[] = ((dailyAllRes[0].rows ?? []) as any[]).map((r) => {
    const raw = r.dimensionValues?.[0]?.value ?? "20000101";
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    return { date, pageviews: rowVal(r, 0), users: rowVal(r, 1) };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topSearchTerms = ((searchTermsRes[0].rows ?? []) as any[]).map((r) => ({
    term: r.dimensionValues?.[0]?.value ?? "",
    count: rowVal(r),
  })).filter((r) => r.term && r.term !== "(not set)");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noResultsTerms = ((noResultsRes[0].rows ?? []) as any[]).map((r) => ({
    term: r.dimensionValues?.[0]?.value ?? "",
    count: rowVal(r),
  })).filter((r) => r.term && r.term !== "(not set)");

  const FUNNEL_LABELS: Record<string, string> = {
    begin_registration:       "Mulai Daftar (kirim OTP)",
    registration_otp_verified: "OTP Terverifikasi",
    sign_up:                  "Registrasi Selesai",
    login_start:              "Mulai Login (kirim OTP)",
    login:                    "Login Berhasil",
  };
  const FUNNEL_ORDER = ["begin_registration", "registration_otp_verified", "sign_up", "login_start", "login"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const funnelMap = Object.fromEntries(((funnelRes[0].rows ?? []) as any[]).map((r) => [
    r.dimensionValues?.[0]?.value ?? "",
    rowVal(r),
  ]));
  const registrationFunnel = FUNNEL_ORDER.map((key) => ({
    event: FUNNEL_LABELS[key] ?? key,
    count: funnelMap[key] ?? 0,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topPlaces = ((topPlacesRes[0].rows ?? []) as any[]).map((r) => ({
    path:  r.dimensionValues?.[0]?.value ?? "/",
    title: (r.dimensionValues?.[1]?.value ?? "").replace(/\s*[|·—-]\s*.*$/, "").trim(),
    views: rowVal(r),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const weekdayDurations = ((weekdayRes[0].rows ?? []) as any[]).map((r) => ({
    day: Number(r.dimensionValues?.[0]?.value ?? 0),
    avgDuration: Number(r.metricValues?.[0]?.value ?? 0),
  }));

  return {
    activeUsers,
    today: parseSingle(todayRes),
    yesterday: parseSingle(yesterdayRes),
    week: parseSingle(weekRes),
    prevWeek: parseSingle(prevWeekRes),
    month: parseSingle(monthRes),
    prevMonth: parseSingle(prevMonthRes),
    allTime: parseSingle(allTimeRes),
    topPages,
    topSources,
    deviceBreakdown,
    countryBreakdown,
    dailyData,
    dailyDataAll,
    engagement: parseEngagement(engagementRes),
    prevEngagement: parseEngagement(prevEngagementRes),
    weekdayDurations,
    topPlaces,
    topSearchTerms,
    noResultsTerms,
    registrationFunnel,
  };
}

export const getGaStats = unstable_cache(fetchGaStats, ["ga-stats"], { revalidate: 300 });

// Fetches ALL period-dependent sections for an arbitrary date range.
// `start`/`end` accept GA relative keywords ("today", "7daysAgo", "2024-01-01", …)
// or explicit YYYY-MM-DD. `prev` (optional) is the comparison window for trends.
export async function fetchGaRange(
  start: string,
  end: string,
  prev?: { start: string; end: string } | null,
): Promise<RangeStats> {
  const client = getClient();
  const dr = [{ startDate: start, endDate: end }];

  const [
    combinedRes, dailyRes, weekdayRes, pagesRes, sourcesRes,
    devicesRes, countriesRes, placesRes, searchRes, noResRes, funnelRes,
    prevRes,
  ] = await Promise.all([
    client.runReport({ property: PROPERTY, dateRanges: dr, metrics: KPI_ENG_METRICS }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "dayOfWeek" }],
      metrics: [{ name: "averageSessionDuration" }],
      orderBys: [{ dimension: { dimensionName: "dayOfWeek" } }],
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 15,
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "country" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/place/" } } },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "searchTerm" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "search" } } },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "searchTerm" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "search_no_results" } } },
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 10,
    }),
    client.runReport({
      property: PROPERTY, dateRanges: dr,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: FUNNEL_ORDER } } },
    }),
    prev
      ? client.runReport({ property: PROPERTY, dateRanges: [{ startDate: prev.start, endDate: prev.end }], metrics: KPI_ENG_METRICS })
      : Promise.resolve(null),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (res: any) => (res?.[0]?.rows ?? []) as any[];

  const dailyData: DailyPoint[] = rows(dailyRes).map((r) => {
    const raw = r.dimensionValues?.[0]?.value ?? "20000101";
    return { date: `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`, pageviews: rowVal(r, 0), users: rowVal(r, 1) };
  });
  const weekdayDurations = rows(weekdayRes).map((r) => ({
    day: Number(r.dimensionValues?.[0]?.value ?? 0),
    avgDuration: Number(r.metricValues?.[0]?.value ?? 0),
  }));
  const topPages = rows(pagesRes).map((r) => ({ path: r.dimensionValues?.[0]?.value ?? "/", views: rowVal(r) }));
  const topSources = rows(sourcesRes).map((r) => ({ source: r.dimensionValues?.[0]?.value ?? "(direct)", sessions: rowVal(r) }));
  const deviceBreakdown = rows(devicesRes).map((r) => ({ device: r.dimensionValues?.[0]?.value ?? "unknown", sessions: rowVal(r) }));
  const countryBreakdown = rows(countriesRes).map((r) => ({ country: r.dimensionValues?.[0]?.value ?? "Unknown", sessions: rowVal(r) }));
  const topPlaces = rows(placesRes).map((r) => ({
    path: r.dimensionValues?.[0]?.value ?? "/",
    title: cleanTitle(r.dimensionValues?.[1]?.value),
    views: rowVal(r),
  }));
  const topSearchTerms = rows(searchRes).map((r) => ({ term: r.dimensionValues?.[0]?.value ?? "", count: rowVal(r) }))
    .filter((r) => r.term && r.term !== "(not set)");
  const noResultsTerms = rows(noResRes).map((r) => ({ term: r.dimensionValues?.[0]?.value ?? "", count: rowVal(r) }))
    .filter((r) => r.term && r.term !== "(not set)");
  const funnelMap = Object.fromEntries(rows(funnelRes).map((r) => [r.dimensionValues?.[0]?.value ?? "", rowVal(r)]));
  const registrationFunnel = FUNNEL_ORDER.map((key) => ({ event: FUNNEL_LABELS[key] ?? key, count: funnelMap[key] ?? 0 }));

  return {
    kpi: parseKpiCombined(combinedRes),
    prevKpi: prevRes ? parseKpiCombined(prevRes) : null,
    dailyData,
    engagement: parseEngCombined(combinedRes),
    prevEngagement: prevRes ? parseEngCombined(prevRes) : null,
    weekdayDurations,
    topPages,
    topSources,
    deviceBreakdown,
    countryBreakdown,
    topPlaces,
    topSearchTerms,
    noResultsTerms,
    registrationFunnel,
  };
}
