import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { useSensorNicknamesStore } from "@/shared/stores/sensor-nicknames-store";
import { sensorKeys } from "./query-keys";
import { collectSensorMessages } from "./collect-sensor-messages";
import { adaptLatestToSensors } from "./adapters";
import { buildMockSensors } from "../lib/mock-sensors";
import type { Sensor } from "../model/types";

// Sobrescreve `name` (o campo que toda a UI exibe) e preserva `nickname` com o
// valor do back-end, para que a busca continue encontrando o sensor pelo nome
// de fábrica mesmo depois de renomeado.
const applyNicknames = (sensors: Sensor[], nicknames: Record<string, string>): Sensor[] =>
  sensors.map((s) => (nicknames[s.devEUI] ? { ...s, name: nicknames[s.devEUI] } : s));

/**
 * Sensores vindos da API. Nunca lança: com a API inteira fora do ar o painel
 * continua de pé com os sensores de demonstração, em vez de tela de erro.
 */
const fetchApiSensors = async (userId: string, token: string): Promise<Sensor[]> => {
  try {
    const leituras = await collectSensorMessages(userId, token);
    if (leituras.length === 0) return [];
    return adaptLatestToSensors({ leituras, total_dispositivos: leituras.length, userId });
  } catch (err) {
    console.warn("[useSensorsList] nenhuma rota de sensores respondeu:", err);
    return [];
  }
};

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
      // Os de demonstração vêm primeiro, e são montados ANTES de pedir o token.
      // Eles não dependem de rede nem de Auth0: se o getToken falhar (refresh
      // token ausente, sessão expirada), o painel ainda abre com eles em vez de
      // cair na tela de erro. São também os únicos com coordenada, então é o
      // que o mapa consegue plotar enquanto o payload LoRa não traz lat/long.
      const mockSensors = buildMockSensors();

      let token: string;
      try {
        token = await getToken();
      } catch (err) {
        console.warn("[useSensorsList] sem token de acesso, só demonstração:", err);
        return mockSensors;
      }

      return [...mockSensors, ...(await fetchApiSensors(userId, token))];
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000,
    select,
  });
};
