import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedSensorState {
  selectedSensorId: string | null;
  setSelectedSensorId: (id: string | null) => void;
}

export const useSelectedSensorStore = create<SelectedSensorState>()(
  persist(
    (set) => ({
      selectedSensorId: null,
      setSelectedSensorId: (id) => set({ selectedSensorId: id }),
    }),
    { name: "smartfarm:selected-sensor" },
  ),
);
