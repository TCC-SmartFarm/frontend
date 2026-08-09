import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { historyQueryOptions, type HistoryCache } from "./history-query-options";
import type { RawReading } from "./fetch-sensor-history";
import { filterReadingsByDays } from "../lib/filter-readings-by-days";

// Recebe o devAddr (identificador do histórico no InfluxDB), não o devEUI.
// O cache guarda o histórico completo; `days` só recorta localmente.
export const useSensorHistory = (devAddr: string | null, days: number) => {
  const { getToken } = useAuthToken();
  const { userId } = useUserId();

  const select = useCallback(
    (cache: HistoryCache): RawReading[] => filterReadingsByDays(cache.readings, days),
    [days],
  );

  return useQuery({
    ...historyQueryOptions(devAddr, userId, getToken),
    select,
  });
};
