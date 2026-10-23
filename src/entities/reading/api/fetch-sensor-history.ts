import { api } from "@/shared/api/base-api";
import type { SensorPayload } from "@/entities/sensor/model/types";

export interface RawReading {
  timestamp: number;
  userId: string;
  applicationId?: string;
  devAddr?: string;
  devEUI: string;
  deviceType?: string;
  name?: string;
  value: Partial<
    {
      [K in keyof SensorPayload]: SensorPayload[K] | null;
    } & {
      latitude: number | null;
      longitude: number | null;
      /** Flag de integridade do pacote LoRa. Vem como boolean, não é plotada. */
      validity: boolean | null;
    }
  >;
}

/**
 * Histórico de um sensor no InfluxDB.
 *
 * O identificador é o **devEUI**, não o devAddr: a rota da `main` filtra por
 * `r["devEUI"] == ...`. Consultar pelo devAddr (`d99eefe3`) devolve lista
 * vazia, porque essa é outra tag da mesma série.
 *
 * Com `var slice []T` sem append, o Go serializa `null` em vez de `[]`. Por
 * isso o `?? []`: sem ele, o `.sort()` de quem consome estoura em sensor sem
 * histórico.
 */
export const fetchSensorHistory = async (
  userId: string,
  devEUI: string,
  days: number,
  accessToken: string,
): Promise<RawReading[]> => {
  const path = `/api/sensors/influx/${encodeURIComponent(userId)}/${days}/${encodeURIComponent(devEUI)}`;
  const readings = await api<RawReading[] | null>(path, { accessToken });
  return readings ?? [];
};
