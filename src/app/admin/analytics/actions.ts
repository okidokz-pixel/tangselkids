"use server";
import { fetchGaRange, type RangeStats } from "@/lib/ga-data";

export async function getRangeStats(
  start: string,
  end: string,
  prev: { start: string; end: string } | null,
): Promise<RangeStats> {
  return fetchGaRange(start, end, prev);
}
