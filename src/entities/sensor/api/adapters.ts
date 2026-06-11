import { DEFAULT_SENSOR_THRESHOLDS } from "@/shared/constants/thresholds";
import type { Sensor, SensorPayload } from "../model/types";
import type { LatestMessage, LatestResponse } from "./fetch-sensors-latest";

const toNumberOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const SENSOR_VALUE_KEYS: (keyof SensorPayload)[] = [
  "soil_temperature",
  "soil_moisture",
  "air_humidity",
  "luminosity",
  "air_temperature",
  "battery",
];

const extractReading = (msg: LatestMessage): Partial<SensorPayload> => {
  const payload = msg.payload ?? {};
  const out: Partial<SensorPayload> = {};
  for (const key of SENSOR_VALUE_KEYS) {
    const value = payload[key];
    if (typeof value === "number") {
      out[key] = value;
    }
  }
  return out;
};

const pickMostRecent = (messages: LatestMessage[]): Map<string, LatestMessage> => {
  const byId = new Map<string, LatestMessage>();
  for (const msg of messages) {
    if (!msg.deviceId) continue;
    const existing = byId.get(msg.deviceId);
    const msgTs = msg.payload?.timestamp ?? 0;
    const existingTs = existing?.payload?.timestamp ?? 0;
    if (!existing || msgTs >= existingTs) {
      byId.set(msg.deviceId, msg);
    }
  }
  return byId;
};

export const adaptLatestToSensors = (raw: LatestResponse): Sensor[] => {
  const byId = pickMostRecent(raw.leituras ?? []);
  const ordered = [...byId.values()].sort((a, b) => a.deviceId.localeCompare(b.deviceId));

  return ordered.map((msg, i) => {
    const friendlyName = msg.name ?? msg.payload?.name ?? `Sensor ${i + 1}`;
    return {
      id: msg.deviceId,
      deviceId: msg.deviceId,
      name: friendlyName,
      nickname: msg.payload?.name ?? friendlyName,
      deviceType: msg.deviceType,
      latitude: toNumberOrNull(msg.payload?.latitude),
      longitude: toNumberOrNull(msg.payload?.longitude),
      thresholds: { ...DEFAULT_SENSOR_THRESHOLDS },
      lastReading: extractReading(msg),
      lastReadingAt: msg.payload?.timestamp,
    };
  });
};
