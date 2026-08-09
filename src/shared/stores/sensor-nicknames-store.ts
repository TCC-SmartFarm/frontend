import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PREFERENCES_KEYS, preferencesStorage } from "@/shared/lib/preferences-storage";

interface SensorNicknamesState {
  /** devEUI → apelido dado pelo usuário. Ausente = usa o nome vindo do back-end. */
  nicknames: Record<string, string>;
  setNickname: (devEUI: string, value: string) => void;
}

export const useSensorNicknamesStore = create<SensorNicknamesState>()(
  persist(
    (set) => ({
      nicknames: {},
      setNickname: (devEUI, value) =>
        set((state) => {
          const next = { ...state.nicknames };
          const trimmed = value.trim();
          // Apelido vazio APAGA a chave em vez de gravar "": gravar string vazia
          // deixaria o sensor sem nome em todas as telas.
          if (trimmed === "") {
            delete next[devEUI];
          } else {
            next[devEUI] = trimmed;
          }
          return { nicknames: next };
        }),
    }),
    {
      name: PREFERENCES_KEYS.sensorNicknames,
      version: 1,
      storage: preferencesStorage<SensorNicknamesState>(),
      partialize: (state) => ({ nicknames: state.nicknames }) as SensorNicknamesState,
    },
  ),
);
