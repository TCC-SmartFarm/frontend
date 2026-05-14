import type { SensorParam } from "@/entities/reading/model/types";
import type { SensorThresholds } from "@/entities/sensor/model/types";

export interface AlertThreshold {
  low?: number;
  high?: number;
}

export const DEFAULT_THRESHOLDS: Record<string, AlertThreshold> = {
  battery: { low: 20 },
  soil_moisture: { low: 30, high: 90 },
  soil_temperature: { high: 35 },
  air_humidity: { low: 20, high: 95 },
  air_temperature: { low: 0, high: 40 },
  luminosity: {},
} as const;

interface ParamThreshold {
  warnLow?: number;
  alertLow?: number;
  warnHigh?: number;
  alertHigh?: number;
}

export const DEFAULT_PARAM_THRESHOLDS: Record<SensorParam, ParamThreshold> = {
  soil_temperature: { warnHigh: 30, alertHigh: 35 },
  soil_moisture: { alertLow: 20, warnLow: 30, warnHigh: 80, alertHigh: 90 },
  air_humidity: { alertLow: 15, warnLow: 20, warnHigh: 90, alertHigh: 95 },
  air_temperature: { alertLow: 0, warnLow: 5, warnHigh: 35, alertHigh: 40 },
  luminosity: {},
  battery: { alertLow: 15, warnLow: 20 },
};

export const DEFAULT_SENSOR_THRESHOLDS: SensorThresholds = {
  soil_temperature_high: 35,
  soil_moisture_low: 30,
  soil_moisture_high: 90,
  air_humidity_low: 20,
  air_humidity_high: 95,
  air_temperature_low: 0,
  air_temperature_high: 40,
  battery_low: 20,
};

export type Status = "ok" | "warn" | "alert";

export const statusForParam = (param: SensorParam, value: number | null | undefined): Status => {
  if (value === null || value === undefined) return "ok";
  const t = DEFAULT_PARAM_THRESHOLDS[param];
  if (t.alertLow !== undefined && value <= t.alertLow) return "alert";
  if (t.alertHigh !== undefined && value >= t.alertHigh) return "alert";
  if (t.warnLow !== undefined && value <= t.warnLow) return "warn";
  if (t.warnHigh !== undefined && value >= t.warnHigh) return "warn";
  return "ok";
};

export const statusLabel = (status: Status): string => {
  if (status === "alert") return "Atenção";
  if (status === "warn") return "Monitorar";
  return "Ideal";
};
