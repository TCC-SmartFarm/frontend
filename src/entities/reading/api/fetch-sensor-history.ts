import { api } from "@/shared/api/base-api";
import type { SensorPayload } from "@/entities/sensor/model/types";

export interface RawReading {
  timestamp: number;
  userId: string;
  applicationId?: string;
  devAddr: string;
  devEUI: string;
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

// O histórico é consultado pelo devAddr (é a tag indexada no InfluxDB), e não
// pelo devEUI que identifica o sensor no resto do front.
export const fetchSensorHistory = (
  devAddr: string,
  days: number,
  accessToken: string,
): Promise<RawReading[]> =>
  api<RawReading[]>(`/api/sensors/influx/${days}/${encodeURIComponent(devAddr)}`, {
    accessToken,
  });
