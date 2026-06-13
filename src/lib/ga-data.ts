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
  topSources: { source: string; sessions: number }[];
  deviceBreakdown: { device: string; sessions: number }[];
  countryBreakdown: { country: string; sessions: number }[];
  dailyData: DailyPoint[];
  dailyDataAll: DailyPoint[];
};

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

  const [
    realtimeRes, todayRes, yesterdayRes, weekRes, prevWeekRes,
    monthRes, prevMonthRes, allTimeRes, pagesRes, sourcesRes,
    devicesRes, countriesRes, dailyRes, dailyAllRes,
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
      limit: 10,
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
  };
}

export const getGaStats = unstable_cache(fetchGaStats, ["ga-stats"], { revalidate: 300 });
