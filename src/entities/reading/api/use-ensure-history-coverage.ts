import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { readingKeys } from "./query-keys";
import type { HistoryCache } from "./use-sensor-history";

export const useEnsureHistoryCoverage = (deviceId: string | null, days: number) => {
  const qc = useQueryClient();
  const { userId } = useUserId();

  useEffect(() => {
    if (!deviceId) return;
    // A chave precisa do userId no final, igual à montada em use-sensor-history —
    // sem ele o getQueryData nunca encontra o cache e toda navegação refaz o fetch.
    const queryKey = [...readingKeys.history(deviceId), userId];
    const cache = qc.getQueryData<HistoryCache>(queryKey);
    if (!cache || cache.maxDaysFetched < days) {
      qc.invalidateQueries({ queryKey });
    }
  }, [deviceId, days, qc, userId]);
};
