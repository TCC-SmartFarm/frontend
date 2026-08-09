import { fetchSensorHistory, type RawReading } from "@/entities/reading/api/fetch-sensor-history";
import { fetchSensorDevices } from "./fetch-sensor-devices";
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
    applicationId: latest.applicationId,
    deviceType: latest.deviceType,
    devEUI: latest.devEUI,
    devAddr: latest.devAddr,
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
  accessToken: string,
): Promise<LatestResponse> => {
  // O cadastro vem do backend (Supabase). Antes era um mapa estático de IDs
  // versionado aqui — que ficava desatualizado a cada sensor novo.
  const { devices } = await fetchSensorDevices(accessToken);
  const results = await Promise.all(
    devices.map((device) =>
      fetchSensorHistory(device.devAddr, FALLBACK_DAYS, accessToken)
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
