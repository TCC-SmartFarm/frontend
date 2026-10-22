/**
 * Resposta do Irrigacao-MSS, servida pelo api-service em /api/v1/irrigation.
 * Só os campos que o front usa estão tipados; o MSS manda mais (a curva de
 * projeção ponto a ponto, o histórico filtrado, a nota metodológica).
 */
export type IrrigationAction =
  | "irrigate_on_recommended_day"
  | "irrigate_with_caution"
  | "not_needed_now"
  | "manual_check"
  | "manual_check_sensor";

export type SoilStatus = "dry" | "intermediate" | "wet";

export type TrendStatus = "increasing" | "decreasing" | "stable";

export interface IrrigationForecastDay {
  /** Data local no fuso do sensor, `YYYY-MM-DD` — sem hora, não é UTC. */
  date: string;
  precipitation_probability_percent: number;
  precipitation_mm: number;
  et0_mm?: number;
  rain_likely: boolean;
}

export interface IrrigationResponse {
  sensor_id: string;
  location: { latitude: number; longitude: number; timezone: string };
  sensor: {
    /** ISO em UTC. O MSS usa o timestamp cru do sensor, sem a correção de sensor-clock.ts. */
    timestamp: string;
    soil_moisture_raw: number;
    soil_moisture_kalman_filtered: number;
  };
  soil_moisture_prediction: {
    trend_status: TrendStatus;
    trend_per_hour: number;
    horizon_hours: number;
    predicted_at_horizon: number;
    confidence_status: "within_threshold" | "high_uncertainty" | "unavailable";
  };
  forecast_today_and_next_5_days: IrrigationForecastDay[];
  forecast_summary: {
    total_precipitation_mm: number;
    max_precipitation_probability_percent: number;
    days_with_likely_rain: number;
  };
  irrigation: {
    soil_status: SoilStatus;
    action: IrrigationAction;
    should_irrigate: boolean | null;
    should_irrigate_today: boolean | null;
    recommended_day: string | null;
    requires_manual_validation: boolean;
    /** Texto pronto, em português, escrito pelo MSS. */
    message: string;
  };
}
