import { fetchSensorHistory, type RawReading } from "@/entities/reading/api/fetch-sensor-history";
import { getDeviceIdsForUser } from "@/features/auth/lib/user-id-map";
import type { LatestMessage, LatestResponse } from "./fetch-sensors-latest";

const FALLBACK_DAYS = 20;

const synthesizeFromReadings = (readings: RawReading[]): LatestMessage | null => {
  if (readings.length === 0) return null;
  const sorted = [...readings].sort((a, b) => b.timestamp - a.timestamp);
  const latest = sorted[0];
  const withCoords = sorted.find(
    (r) => r.value.latitude != null && r.value.longitude != null,
  );
  const { latitude, longitude, ...sensorValues } = latest.value;
  return {
    userId: latest.userId,
    deviceType: latest.deviceType,
    deviceId: latest.deviceId,
    name: latest.name,
    payload: {
      ...sensorValues,
      latitude: withCoords?.value.latitude ?? latitude ?? null,
      longitude: withCoords?.value.longitude ?? longitude ?? null,
      timestamp: latest.timestamp,
    },
  };
};

export const fetchSensorsLatestFromInflux = async (
  userId: string,
): Promise<LatestResponse> => {
  const deviceIds = getDeviceIdsForUser(userId);
  const results = await Promise.all(
    deviceIds.map((id) =>
      fetchSensorHistory(userId, id, FALLBACK_DAYS)
        .then(synthesizeFromReadings)
        .catch(() => null),
    ),
  );
  const leituras = results.filter((m): m is LatestMessage => m !== null);
  return {
    leituras,
    total_dispositivos: leituras.length,
    usuario: userId,
  };
};
