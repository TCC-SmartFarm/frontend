export interface SensorThresholds {
  soil_temperature_high?: number;
  soil_moisture_low?: number;
  soil_moisture_high?: number;
  air_humidity_low?: number;
  air_humidity_high?: number;
  air_temperature_low?: number;
  air_temperature_high?: number;
  battery_low?: number;
}

export interface SensorPayload {
  soil_temperature: number;
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
   * Endereço LoRa do dispositivo. Serve só para consultar o histórico
   * em /api/sensors/influx/:days/:devAddr — o InfluxDB é indexado por ele.
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
