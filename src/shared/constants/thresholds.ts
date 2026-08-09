import type { SensorParam } from "@/entities/reading/model/types";
import type { SensorThresholds } from "@/entities/sensor/model/types";

export interface ParamThreshold {
  warnLow?: number;
  alertLow?: number;
  warnHigh?: number;
  alertHigh?: number;
}

export type ParamThresholdMap = Record<SensorParam, ParamThreshold>;

export const PARAM_THRESHOLD_FIELDS = [
  "alertLow",
  "warnLow",
  "warnHigh",
  "alertHigh",
] as const satisfies readonly (keyof ParamThreshold)[];

export type ParamThresholdField = (typeof PARAM_THRESHOLD_FIELDS)[number];

export const DEFAULT_PARAM_THRESHOLDS: ParamThresholdMap = {
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

const EMPTY_THRESHOLD: ParamThreshold = {};

/** Lado do limite que o valor estourou — define se a leitura está baixa ou alta. */
export type BreachSide = "low" | "high" | null;

export interface ParamEvaluation {
  status: Status;
  side: BreachSide;
}

// O mapa é argumento obrigatório (e vem primeiro) de propósito: os limites são
// editáveis pelo usuário, e um parâmetro opcional deixaria qualquer call site
// esquecido lendo os defaults em silêncio.
export const evaluateParam = (
  map: ParamThresholdMap,
  param: SensorParam,
  value: number | null | undefined,
): ParamEvaluation => {
  if (value === null || value === undefined) return { status: "ok", side: null };
  // Guarda contra um blob antigo/corrompido no storage sem alguma das chaves.
  const t = map[param] ?? EMPTY_THRESHOLD;
  if (t.alertLow !== undefined && value <= t.alertLow) return { status: "alert", side: "low" };
  if (t.alertHigh !== undefined && value >= t.alertHigh) return { status: "alert", side: "high" };
  if (t.warnLow !== undefined && value <= t.warnLow) return { status: "warn", side: "low" };
  if (t.warnHigh !== undefined && value >= t.warnHigh) return { status: "warn", side: "high" };
  return { status: "ok", side: null };
};

// Derivado de evaluateParam para que status e lado nunca possam divergir.
export const statusForParam = (
  map: ParamThresholdMap,
  param: SensorParam,
  value: number | null | undefined,
): Status => evaluateParam(map, param, value).status;

export const statusLabel = (status: Status): string => {
  if (status === "alert") return "Atenção";
  if (status === "warn") return "Monitorar";
  return "Ideal";
};
