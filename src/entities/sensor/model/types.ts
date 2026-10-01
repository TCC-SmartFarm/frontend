export interface SensorThresholds {
  soil_moisture_low?: number;
  soil_moisture_high?: number;
  air_humidity_low?: number;
  air_humidity_high?: number;
  air_temperature_low?: number;
  air_temperature_high?: number;
  battery_low?: number;
}

export interface SensorPayload {
  soil_moisture: number;
  air_humidity: number;
  luminosity: number;
  air_temperature: number;
  battery: number;
}

export interface Sensor {
  id: string;
  /**
   * Identidade do sensor no front: seleção, rotas e chaves de lista.
   * É o mesmo identificador usado na chave do cache no Redis
   * (userId:X:devEUI:Y:history) e na rota /api/sensors/latest/:devEUI.
   */
  devEUI: string;
  /**
   * Endereço LoRa atribuído pelo network server. Vem no envelope e fica aqui
   * por completude — **não** é usado em requisição nenhuma: desde a `main` de
   * 09/09/2026 o histórico também é consultado pelo devEUI.
   */
  devAddr: string;
  name: string;
  nickname: string;
  deviceType?: string;
  latitude: number | null;
  longitude: number | null;
  thresholds: SensorThresholds;
  lastReading?: Partial<SensorPayload>;
  lastReadingAt?: number;
}
