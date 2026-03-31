export type SensorParam =
  | "soil_temperature"
  | "soil_moisture"
  | "air_humidity"
  | "luminosity"
  | "air_temperature"
  | "battery";

export interface Reading {
  sensor_id: string;
  timestamp: string;
  soil_temperature: number | null;
  soil_moisture: number | null;
  air_humidity: number | null;
  luminosity: number | null;
  air_temperature: number | null;
  battery: number | null;
}
