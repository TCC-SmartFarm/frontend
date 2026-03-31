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

export interface Sensor {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  thresholds: SensorThresholds;
  created_at: string;
  updated_at: string;
}
