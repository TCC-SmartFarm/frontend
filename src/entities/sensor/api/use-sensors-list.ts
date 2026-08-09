import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { useSensorNicknamesStore } from "@/shared/stores/sensor-nicknames-store";
import { sensorKeys } from "./query-keys";
import { fetchSensorsLatest } from "./fetch-sensors-latest";
import { fetchSensorsLatestFromInflux } from "./fetch-sensors-fallback";
import { adaptLatestToSensors } from "./adapters";
import type { Sensor } from "../model/types";

// Sobrescreve `name` (o campo que toda a UI exibe) e preserva `nickname` com o
// valor do back-end, para que a busca continue encontrando o sensor pelo nome
// de fábrica mesmo depois de renomeado.
const applyNicknames = (sensors: Sensor[], nicknames: Record<string, string>): Sensor[] =>
  sensors.map((s) => (nicknames[s.devEUI] ? { ...s, name: nicknames[s.devEUI] } : s));

export const useSensorsList = () => {
  const { getToken, isAuthenticated } = useAuthToken();
  const { userId } = useUserId();
  const nicknames = useSensorNicknamesStore((s) => s.nicknames);

  // Via `select` (e não embrulhando o retorno) o UseQueryResult continua intacto
  // para os consumidores: .data, .isPending, .error, .refetch, .isFetching.
  const select = useCallback(
    (sensors: Sensor[]) => applyNicknames(sensors, nicknames),
    [nicknames],
  );

  return useQuery({
    queryKey: [...sensorKeys.list(), userId],
    queryFn: async () => {
      const token = await getToken();
      try {
        const response = await fetchSensorsLatest(token);
        if (response.leituras && response.leituras.length > 0) {
          return adaptLatestToSensors(response);
        }
      } catch (err) {
        console.warn("[useSensorsList] /all falhou, caindo no influx:", err);
      }
      const fallback = await fetchSensorsLatestFromInflux(userId, token);
      return adaptLatestToSensors(fallback);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    select,
  });
};
