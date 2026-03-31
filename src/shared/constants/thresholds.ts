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
