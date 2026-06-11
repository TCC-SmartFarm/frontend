import { api } from "@/shared/api/base-api";
import type { SensorPayload } from "@/entities/sensor/model/types";

export interface RawReading {
  timestamp: number;
  userId: string;
  deviceId: string;
  deviceType: string;
  name?: string;
  value: Partial<
    {
      [K in keyof SensorPayload]: SensorPayload[K] | null;
    } & {
      latitude: number | null;
      longitude: number | null;
    }
  >;
}

export const fetchSensorHistory = (
  deviceId: string,
  days: number,
  accessToken: string,
): Promise<RawReading[]> =>
  api<RawReading[]>(`/api/sensors/influx/${days}/${encodeURIComponent(deviceId)}`, {
    accessToken,
  });
