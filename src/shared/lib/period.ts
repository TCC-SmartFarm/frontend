export type Period = "7d" | "15d" | "30d" | "3m" | "6m" | "1y" | "max";

export interface PeriodOption {
  value: Period;
  label: string;
  days: number;
}

// Sentinela do "Máximo": não é uma janela real, é um número grande o bastante
// para o cutoff de filterReadingsByDays cair antes de qualquer leitura, devolvendo
// o cache inteiro. Não usar Infinity — ele vazaria para comparações numéricas.
export const MAX_PERIOD_DAYS = 3650;

export const PERIOD_LIST: PeriodOption[] = [
  { value: "7d", label: "7 dias", days: 7 },
  { value: "15d", label: "15 dias", days: 15 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "3m", label: "3 meses", days: 90 },
  { value: "6m", label: "6 meses", days: 180 },
  { value: "1y", label: "1 ano", days: 365 },
  { value: "max", label: "Máximo", days: MAX_PERIOD_DAYS },
];

export const periodToDays = (period: Period): number => {
  const found = PERIOD_LIST.find((p) => p.value === period);
  return found?.days ?? 7;
};

export const periodLabel = (period: Period): string => {
  return PERIOD_LIST.find((p) => p.value === period)?.label ?? period;
};

// Tolerância de 1 dia: um sensor com 29,6 dias de histórico não deve ter o botão
// "30 dias" bloqueado por causa de arredondamento.
export const isPeriodAvailable = (option: PeriodOption, availableDays: number | undefined): boolean => {
  if (option.value === "max") return true;
  if (availableDays === undefined || availableDays <= 0) return true;
  return option.days <= availableDays + 1;
};
