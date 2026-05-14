import type { RawReading } from "../api/fetch-sensor-history";

export const filterReadingsByDays = (readings: RawReading[], days: number): RawReading[] => {
  if (readings.length === 0) return readings;
  const cutoff = Math.floor(Date.now() / 1000) - days * 86400;

  let lo = 0;
  let hi = readings.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (readings[mid].timestamp < cutoff) lo = mid + 1;
    else hi = mid;
  }
  return readings.slice(lo);
};
