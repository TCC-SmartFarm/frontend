import type { RawReading } from "../api/fetch-sensor-history";

// Quantos dias de histórico existem de fato, medidos da leitura mais antiga até
// agora — a mesma referência usada por filterReadingsByDays (cutoff = now - N).
// Assume o array ordenado crescentemente (garantido em historyQueryOptions).
export const availableDaysFrom = (readings: RawReading[]): number => {
  if (readings.length === 0) return 0;
  const nowSec = Math.floor(Date.now() / 1000);
  return Math.floor((nowSec - readings[0].timestamp) / 86400);
};
