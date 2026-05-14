import { DEFAULT_SENSOR_THRESHOLDS } from "@/shared/constants/thresholds";
import type { Sensor } from "../model/types";
import type { LatestMessage, LatestResponse } from "./fetch-sensors-latest";

const pickMostRecent = (messages: LatestMessage[]): Map<string, LatestMessage> => {
  const byId = new Map<string, LatestMessage>();
  for (const msg of messages) {
    if (!msg.deviceId) continue;
    const existing = byId.get(msg.deviceId);
    const msgTs = msg.timestamp ?? 0;
    const existingTs = existing?.timestamp ?? 0;
    if (!existing || msgTs >= existingTs) {
      byId.set(msg.deviceId, msg);
    }
  }
  return byId;
};

export const adaptLatestToSensors = (raw: LatestResponse): Sensor[] => {
  const byId = pickMostRecent(raw.data);
  const ordered = [...byId.values()].sort((a, b) => a.deviceId.localeCompare(b.deviceId));

  return ordered.map((msg, i) => {
    const friendlyName = msg.name ?? msg.nickname ?? `Sensor ${i + 1}`;
    return {
      id: msg.deviceId,
      deviceId: msg.deviceId,
      name: friendlyName,
      nickname: msg.nickname ?? friendlyName,
      deviceType: msg.deviceType,
      latitude: msg.latitude ?? null,
      longitude: msg.longitude ?? null,
      thresholds: { ...DEFAULT_SENSOR_THRESHOLDS },
      lastReading: msg.payload ?? {},
      lastReadingAt: msg.timestamp,
    };
  });
};
