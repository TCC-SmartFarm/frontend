import type { IrrigationAction, IrrigationResponse } from "@/entities/irrigation/model/types";
import type { Sensor } from "@/entities/sensor/model/types";

export interface SensorIrrigation {
  sensor: Sensor;
  data?: IrrigationResponse;
  error: unknown;
  refetch: () => void;
}

/**
 * O que a faixa mostra, decidido a partir da recomendação de todos os sensores:
 *
 * - `all-normal`: ninguém precisa de nada → "tudo certo"
 * - `single-problem`: um sensor pede atenção → a faixa mostra ele
 * - `multi-problem`: vários pedem → a faixa resume ("3 sensores precisam de atenção")
 * - `unavailable`: nenhum sensor teve resposta (MSS fora, por exemplo)
 */
export type IrrigationSummary =
  | { kind: "loading" }
  | { kind: "unavailable"; items: SensorIrrigation[] }
  | { kind: "all-normal"; items: SensorIrrigation[] }
  | { kind: "single-problem"; focus: SensorIrrigation; normal: SensorIrrigation[] }
  | { kind: "multi-problem"; problems: SensorIrrigation[]; normal: SensorIrrigation[] };

// Menor = mais urgente. O foco do painel é a irrigação, então as decisões de
// irrigar vêm antes dos avisos sobre o próprio sensor; e "irrigar hoje" vence
// "irrigar sábado" porque tem prazo.
const ACTION_URGENCY: Record<IrrigationAction, number> = {
  irrigate_on_recommended_day: 1,
  irrigate_with_caution: 2,
  manual_check_sensor: 3,
  manual_check: 4,
  not_needed_now: 9,
};

/** Sensor sem resposta do MSS fica por último entre os que pedem atenção. */
const NO_DATA_URGENCY = 5;

export const urgencyOf = ({ data }: SensorIrrigation): number => {
  if (!data) return NO_DATA_URGENCY;
  const { action, should_irrigate_today } = data.irrigation;
  if (action === "irrigate_on_recommended_day" && should_irrigate_today) return 0;
  return ACTION_URGENCY[action];
};

const isNormal = (item: SensorIrrigation): boolean => item.data?.irrigation.action === "not_needed_now";

export const summarizeIrrigation = (items: SensorIrrigation[], isLoading: boolean): IrrigationSummary => {
  if (isLoading) return { kind: "loading" };
  if (items.every((i) => !i.data)) return { kind: "unavailable", items };

  const normal = items.filter(isNormal);
  const problems = items.filter((i) => !isNormal(i)).sort((a, b) => urgencyOf(a) - urgencyOf(b));

  if (problems.length === 0) return { kind: "all-normal", items };
  if (problems.length === 1) return { kind: "single-problem", focus: problems[0], normal };
  return { kind: "multi-problem", problems, normal };
};

/** Para o subtítulo do resumo: "2 para irrigar · 1 para conferir". */
export const countByNeed = (problems: SensorIrrigation[]) => {
  const irrigate = problems.filter((i) => urgencyOf(i) <= ACTION_URGENCY.irrigate_with_caution).length;
  return { irrigate, check: problems.length - irrigate };
};

/**
 * Maior chance de chuva entre os sensores. Numa propriedade pequena todos caem
 * praticamente na mesma previsão; quando não, vale mostrar o pior caso.
 */
export const maxRainChance = (items: SensorIrrigation[]): number | null => {
  const values = items.flatMap((i) => (i.data ? [i.data.forecast_summary.max_precipitation_probability_percent] : []));
  return values.length > 0 ? Math.max(...values) : null;
};
