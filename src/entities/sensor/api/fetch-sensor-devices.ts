import { api } from "@/shared/api/base-api";

export interface SensorDevice {
  /** Identidade do sensor: seleção, rotas e chave do cache. */
  devEUI: string;
  /** Endereço LoRa: é por ele que o histórico é consultado no InfluxDB. */
  devAddr: string;
}

export interface DevicesResponse {
  usuario: string;
  total: number;
  devices: SensorDevice[];
}

/**
 * Cadastro de sensores do usuário autenticado.
 *
 * O backend responde consultando o Supabase — a mesma tabela que o mqtt-sub usa
 * na ingestão para descobrir de quem é cada dispositivo. Substituiu o mapa
 * estático de IDs que existia aqui no front.
 */
export const fetchSensorDevices = (accessToken: string) =>
  api<DevicesResponse>("/api/sensors/devices", { accessToken });
