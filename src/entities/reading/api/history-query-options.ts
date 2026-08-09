import { readingKeys } from "./query-keys";
import { fetchSensorHistory, type RawReading } from "./fetch-sensor-history";

export interface HistoryCache {
  readings: RawReading[];
}

// Janela ÚNICA de busca: o histórico é baixado inteiro uma vez por sensor e os
// períodos do gráfico são recortes locais desse cache. Isso mantém a queryFn
// pura em relação à queryKey (que só tem devAddr + userId) e faz a troca de
// período não disparar request nenhuma.
//
// Estes são os dois botões de ajuste caso o volume de dados cresça — quando o
// back-end expuser agregação (?resolution=daily), só fetch-sensor-history muda.
export const HISTORY_FETCH_DAYS = 365;
export const HISTORY_STALE_MS = 30 * 60 * 1000;

// Base compartilhada por todos os observers desta query. Dois useQuery na mesma
// chave com opções divergentes teriam comportamento dependente de qual montou
// primeiro — por isso queryFn/staleTime/enabled vêm daqui, e só o `select` varia.
export const historyQueryOptions = (
  devAddr: string | null,
  userId: string,
  getToken: () => Promise<string>,
) => ({
  queryKey: readingKeys.history(devAddr ?? "__none__", userId),
  enabled: !!devAddr,
  staleTime: HISTORY_STALE_MS,
  queryFn: async (): Promise<HistoryCache> => {
    if (!devAddr) return { readings: [] };
    const token = await getToken();
    const readings = await fetchSensorHistory(devAddr, HISTORY_FETCH_DAYS, token);
    // Ordem crescente é pré-requisito da busca binária do filtro e do cálculo
    // de disponibilidade, que assumem readings[0] como a leitura mais antiga.
    readings.sort((a, b) => a.timestamp - b.timestamp);
    return { readings };
  },
});
