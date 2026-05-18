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
  userId: string,
  deviceId: string,
  days: number,
): Promise<RawReading[]> =>
  api<RawReading[]>(
    `/api/sensors/influx/${encodeURIComponent(userId)}/${days}/${encodeURIComponent(deviceId)}`,
  );
