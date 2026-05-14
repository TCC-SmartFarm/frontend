import { api } from "@/shared/api/base-api";
import type { SensorPayload } from "@/entities/sensor/model/types";

export interface RawReading {
  timestamp: number;
  userId: string;
  deviceId: string;
  deviceType: string;
  value: Partial<{
    [K in keyof SensorPayload]: SensorPayload[K] | null;
  }>;
}

export const fetchSensorHistory = (
  deviceId: string,
  days: number,
  token: string,
): Promise<RawReading[]> =>
  api<RawReading[]>(`/api/sensors/${days}/${encodeURIComponent(deviceId)}`, {
    accessToken: token,
  });
