import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { useSensorNicknamesStore } from "@/shared/stores/sensor-nicknames-store";
import { sensorKeys } from "./query-keys";
import { collectSensorMessages } from "./collect-sensor-messages";
import { adaptLatestToSensors } from "./adapters";
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
      // Havia aqui uma lista de sensores de demonstração gerada no navegador,
      // somada à da API. Ela existia porque o `sensor-simulator` estava órfão:
      // publicava no broker MQTT próprio e ninguém escutava. Deixou de ser
      // verdade em 17/09/2026 — a VM voltou com a imagem do `mqtt-sub` que lê
      // aquele broker, então `1e23a01`, `1e23a02` e `1e23a03` chegam pela API,
      // com dado que atravessou RabbitMQ, Redis e InfluxDB de fato.
      //
      // Mantê-la duplicava os três: sete cards no painel e seis pins no mapa,
      // sobrepostos dois a dois nas mesmas coordenadas. Entre exibir a série
      // sintética e a que passou pelo pipeline, vale a segunda — é a que prova
      // que a arquitetura funciona.
      let token: string;
      try {
        token = await getToken();
      } catch (err) {
        // Sem token não há o que buscar. Devolve lista vazia em vez de lançar:
        // o painel abre no estado vazio, não na tela de erro. Era este o
        // amortecedor que os sensores de demonstração davam de graça ao
        // `Missing Refresh Token`, e que agora depende deste catch.
        console.warn("[useSensorsList] sem token de acesso:", err);
        return [];
      }

      return fetchApiSensors(userId, token);
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000,
    select,
  });
};
