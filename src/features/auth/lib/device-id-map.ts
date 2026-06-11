// Mapa estático usado apenas pelo fallback via Influx quando o cache (Redis)
// está vazio. Débito conhecido: o ideal é um endpoint "meus dispositivos" no
// backend.
const DEVICE_IDS_BY_USER_ID: Record<string, string[]> = {
  fazenda1: ["1e23456"],
  fazenda2: [],
  fazenda3: [],
};

export const getDeviceIdsForUser = (userId: string): string[] =>
  DEVICE_IDS_BY_USER_ID[userId] ?? [];
