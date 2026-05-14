import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { readingKeys } from "./query-keys";
import type { HistoryCache } from "./use-sensor-history";

export const useEnsureHistoryCoverage = (deviceId: string | null, days: number) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!deviceId) return;
    const cache = qc.getQueryData<HistoryCache>(readingKeys.history(deviceId));
    if (!cache || cache.maxDaysFetched < days) {
      qc.invalidateQueries({ queryKey: readingKeys.history(deviceId) });
    }
  }, [deviceId, days, qc]);
};
