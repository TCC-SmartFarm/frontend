import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { historyQueryOptions, type HistoryCache } from "./history-query-options";
import { availableDaysFrom } from "../lib/available-days";

// Module-level para ter identidade estável: o TanStack memoiza o resultado do
// select por (data, selectFn), então uma arrow inline recalcularia a cada render.
const selectAvailableDays = (cache: HistoryCache): number =>
  availableDaysFrom(cache.readings);

// Compartilha a query com useSensorHistory (mesma chave, mesma queryFn) e só
// projeta outro recorte: quantos dias de dados o sensor realmente tem.
export const useHistoryAvailability = (devAddr: string | null) => {
  const { getToken } = useAuthToken();
  const { userId } = useUserId();

  return useQuery({
    ...historyQueryOptions(devAddr, userId, getToken),
    select: selectAvailableDays,
  });
};
