import { api } from "@/shared/api/base-api";
import type { SensorPayload } from "../model/types";

export interface LatestMessage {
  userId: string;
  deviceType: string;
  deviceId: string;
  name?: string;
  payload: Partial<SensorPayload> & {
    name?: string;
    latitude?: string | number | null;
    longitude?: string | number | null;
    timestamp?: number;
  };
}

export interface LatestResponse {
  leituras: LatestMessage[];
  total_dispositivos: number;
  usuario: string;
}

export const fetchSensorsLatest = (accessToken: string) =>
  api<LatestResponse>("/api/sensors/all", { accessToken });
