import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { historyQueryOptions, type HistoryCache } from "./history-query-options";
import type { RawReading } from "./fetch-sensor-history";
import { filterReadingsByDays } from "../lib/filter-readings-by-days";

// Recebe o devEUI: é por ele que a rota /api/sensors/influx/:userId/:days/:devEUI
// filtra no Influx. O cache guarda o histórico completo; `days` só recorta
// localmente.
export const useSensorHistory = (devEUI: string | null, days: number) => {
  const { getToken } = useAuthToken();
  const { userId } = useUserId();

  const select = useCallback(
    (cache: HistoryCache): RawReading[] => filterReadingsByDays(cache.readings, days),
    [days],
  );

  return useQuery({
    ...historyQueryOptions(devEUI, userId, getToken),
    select,
  });
};
