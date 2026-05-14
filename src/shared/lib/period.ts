export type Period = "7d" | "15d" | "30d" | "3m" | "6m" | "1y";

export interface PeriodOption {
  value: Period;
  label: string;
  days: number;
}

export const PERIOD_LIST: PeriodOption[] = [
  { value: "7d", label: "7 dias", days: 7 },
  { value: "15d", label: "15 dias", days: 15 },
  { value: "30d", label: "30 dias", days: 30 },
  { value: "3m", label: "3 meses", days: 90 },
  { value: "6m", label: "6 meses", days: 180 },
  { value: "1y", label: "1 ano", days: 365 },
];

export const periodToDays = (period: Period): number => {
  const found = PERIOD_LIST.find((p) => p.value === period);
  return found?.days ?? 7;
};

export const periodLabel = (period: Period): string => {
  return PERIOD_LIST.find((p) => p.value === period)?.label ?? period;
};
