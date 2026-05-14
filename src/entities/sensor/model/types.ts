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
  deviceId: string;
  name: string;
  nickname: string;
  deviceType?: string;
  latitude: number | null;
  longitude: number | null;
  thresholds: SensorThresholds;
  lastReading?: Partial<SensorPayload>;
  lastReadingAt?: number;
}
