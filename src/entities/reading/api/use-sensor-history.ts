import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { readingKeys } from "./query-keys";
import { fetchSensorHistory, type RawReading } from "./fetch-sensor-history";
import { filterReadingsByDays } from "../lib/filter-readings-by-days";

export interface HistoryCache {
  readings: RawReading[];
  maxDaysFetched: number;
  fetchedAt: number;
}

export const useSensorHistory = (deviceId: string | null, days: number) => {
  const { getToken } = useAuthToken();
  const { userId } = useUserId();
  const qc = useQueryClient();
  const safeId = deviceId ?? "__none__";

  return useQuery<HistoryCache, Error, RawReading[]>({
    queryKey: [...readingKeys.history(safeId), userId],
    enabled: !!deviceId,
    staleTime: 14 * 60 * 1000,
    queryFn: async () => {
      if (!deviceId) {
        return { readings: [], maxDaysFetched: 0, fetchedAt: Date.now() };
      }
      const existing = qc.getQueryData<HistoryCache>([
        ...readingKeys.history(deviceId),
        userId,
      ]);
      const effectiveDays = Math.max(days, existing?.maxDaysFetched ?? 0);
      const token = await getToken();
      const readings = await fetchSensorHistory(deviceId, effectiveDays, token);
      readings.sort((a, b) => a.timestamp - b.timestamp);
      return {
        readings,
        maxDaysFetched: effectiveDays,
        fetchedAt: Date.now(),
      };
    },
    select: (cache) => filterReadingsByDays(cache.readings, days),
  });
};
