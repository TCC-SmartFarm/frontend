import { fetchRegisteredDevEUIs } from "./fetch-registered-dev-euis";
import { fetchSensorLatestCache } from "./fetch-sensor-latest-cache";
import { fetchSensorsLatest, type LatestMessage } from "./fetch-sensors-latest";

const messageDevEUI = (msg: LatestMessage): string => msg.devEUI || msg.deviceId || "";

/**
 * A leitura mais recente do lote, escolhida pelo timestamp — nunca por posição.
 *
 * A rota promete "mais recente primeiro", e no cache hit ela cumpre. No
 * repopulamento não: o `sort` do Flux é por tabela, e o Influx devolve uma
 * tabela por série. Como o dispositivo foi gravado sob dois `userId` diferentes
 * (o cadastrado e o `applicationId` que o mqtt-sub usa quando não acha o dono),
 * vêm duas tabelas, e o `reverseArray` do back-end inverte a concatenação
 * delas — jogando para o índice 0 a leitura mais antiga da última tabela.
 *
 * Medido contra a API local: o índice 0 trazia 01/09 com bateria 95%, enquanto
 * a leitura real mais nova era 09/09 com bateria 0%.
 */
const mostRecent = (messages: LatestMessage[]): LatestMessage | null =>
  messages.reduce<LatestMessage | null>(
    (best, msg) =>
      !best || (msg.payload?.timestamp ?? 0) > (best.payload?.timestamp ?? 0) ? msg : best,
    null,
  );

/**
 * Quais dispositivos existem: os que `/api/sensors/all/:userId` conhece somados
 * aos que o usuário cadastrou no Supabase.
 *
 * As duas fontes cobrem casos diferentes. A `/all` traz o que já tem leitura
 * sob este userId — é por ela que chegam os sensores do simulador, que não
 * estão cadastrados em lugar nenhum. O cadastro traz o sensor recém-adicionado
 * e o que está com o cache frio.
 *
 * Só a lista interessa da `/all`, não as leituras: o que essa rota devolve por
 * sensor é o `LINDEX 0` do Redis, que sofre da mesma inversão descrita acima.
 * E ela falha de dois jeitos previsíveis com o cache frio — **404** se o
 * usuário não tem leitura nenhuma e **500** se tem, porque o `group()` antes do
 * `pivot` junta o boolean `validity` com os floats e o Influx recusa a
 * consulta com `schema collision`. Nos dois casos sobra o cadastro.
 */
const discoverDevEUIs = async (userId: string, accessToken: string): Promise<string[]> => {
  const fromApi = async (): Promise<string[]> => {
    try {
      const response = await fetchSensorsLatest(userId, accessToken);
      return (response.leituras ?? []).map(messageDevEUI).filter(Boolean);
    } catch {
      // Silencioso de propósito: 404 e 500 aqui são estado normal de cache frio.
      return [];
    }
  };

  const [registered, found] = await Promise.all([
    fetchRegisteredDevEUIs(userId, accessToken),
    fromApi(),
  ]);
  return [...new Set([...registered, ...found])];
};

/**
 * Última leitura de cada sensor do usuário.
 *
 * Descobre os dispositivos pela `/all` e busca a leitura de cada um pela
 * `/api/sensors/latest/:userId/:devEUI`. Custa uma requisição a mais, e paga
 * por duas coisas: a leitura vem escolhida por timestamp em vez de posição, e
 * cada chamada repopula o Redis — depois dela a `/all` volta a responder pelo
 * cache em vez de refazer a consulta no Influx.
 *
 * Um dispositivo que falha não derruba os outros; ele só fica de fora.
 */
export const collectSensorMessages = async (
  userId: string,
  accessToken: string,
): Promise<LatestMessage[]> => {
  const devEUIs = await discoverDevEUIs(userId, accessToken);

  const messages = await Promise.all(
    devEUIs.map((devEUI) =>
      fetchSensorLatestCache(userId, devEUI, accessToken).then(mostRecent).catch(() => null),
    ),
  );

  return messages.filter((m): m is LatestMessage => m !== null);
};
