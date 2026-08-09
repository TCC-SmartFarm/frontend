import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PREFERENCES_KEYS, preferencesStorage } from "@/shared/lib/preferences-storage";
import {
  DEFAULT_PARAM_THRESHOLDS,
  type ParamThreshold,
  type ParamThresholdMap,
} from "@/shared/constants/thresholds";
import type { SensorParam } from "@/entities/reading/model/types";

interface ThresholdsState {
  thresholds: ParamThresholdMap;
  setParamThreshold: (param: SensorParam, next: ParamThreshold) => void;
  replaceAll: (next: ParamThresholdMap) => void;
  resetAll: () => void;
}

const cloneDefaults = (): ParamThresholdMap =>
  Object.fromEntries(
    Object.entries(DEFAULT_PARAM_THRESHOLDS).map(([param, t]) => [param, { ...t }]),
  ) as ParamThresholdMap;

// Parte sempre dos defaults e sobrepõe só chaves conhecidas: um blob antigo no
// storage sem algum parâmetro (ou com lixo) não pode deixar o mapa incompleto.
export const mergeThresholdMap = (persisted: unknown): ParamThresholdMap => {
  const base = cloneDefaults();
  if (!persisted || typeof persisted !== "object") return base;
  const source = persisted as Record<string, unknown>;
  for (const param of Object.keys(base) as SensorParam[]) {
    const value = source[param];
    if (!value || typeof value !== "object") continue;
    const raw = value as Record<string, unknown>;
    const next: ParamThreshold = {};
    for (const field of ["alertLow", "warnLow", "warnHigh", "alertHigh"] as const) {
      if (typeof raw[field] === "number" && Number.isFinite(raw[field])) {
        next[field] = raw[field] as number;
      }
    }
    base[param] = next;
  }
  return base;
};

export const useThresholdsStore = create<ThresholdsState>()(
  persist(
    (set) => ({
      thresholds: cloneDefaults(),
      setParamThreshold: (param, next) =>
        set((state) => ({ thresholds: { ...state.thresholds, [param]: next } })),
      replaceAll: (next) => set({ thresholds: next }),
      resetAll: () => set({ thresholds: cloneDefaults() }),
    }),
    {
      name: PREFERENCES_KEYS.thresholds,
      version: 1,
      storage: preferencesStorage<ThresholdsState>(),
      partialize: (state) => ({ thresholds: state.thresholds }) as ThresholdsState,
      merge: (persisted, current) => ({
        ...current,
        thresholds: mergeThresholdMap(
          (persisted as { thresholds?: unknown } | undefined)?.thresholds,
        ),
      }),
    },
  ),
);
