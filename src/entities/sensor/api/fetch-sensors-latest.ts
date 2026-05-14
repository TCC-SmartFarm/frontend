import { api } from "@/shared/api/base-api";
import type { SensorPayload } from "../model/types";

export interface LatestMessage {
  userId: string;
  deviceType: string;
  deviceId: string;
  latitude?: number | null;
  longitude?: number | null;
  timestamp?: number;
  name?: string;
  nickname?: string;
  payload: Partial<SensorPayload>;
}

export interface LatestResponse {
  status: string;
  messages_count: number;
  queue_total: number;
  data: LatestMessage[];
}

export const fetchSensorsLatest = (token: string) =>
  api<LatestResponse>("/api/sensors/latest", { accessToken: token });
