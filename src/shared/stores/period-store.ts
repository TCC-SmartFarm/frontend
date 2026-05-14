import { create } from "zustand";
import type { Period } from "@/shared/lib/period";

interface PeriodState {
  period: Period;
  setPeriod: (p: Period) => void;
}

export const usePeriodStore = create<PeriodState>((set) => ({
  period: "7d",
  setPeriod: (period) => set({ period }),
}));
