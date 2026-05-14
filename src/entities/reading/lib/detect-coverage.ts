import type { RawReading } from "../api/fetch-sensor-history";

export interface Coverage {
  requestedDays: number;
  actualDays: number;
  isPartial: boolean;
}

export const detectCoverage = (readings: RawReading[], requestedDays: number): Coverage => {
  if (readings.length === 0) {
    return { requestedDays, actualDays: 0, isPartial: true };
  }
  const oldest = readings[0].timestamp;
  const now = Math.floor(Date.now() / 1000);
  const actualDays = Math.ceil((now - oldest) / 86400);
  const isPartial = actualDays < requestedDays - 1;
  return { requestedDays, actualDays, isPartial };
};
