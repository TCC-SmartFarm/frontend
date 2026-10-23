import { api } from "@/shared/api/base-api";
import type { LatestMessage } from "./fetch-sensors-latest";

/**
 * Histórico curto de um sensor (até 20 leituras, da mais recente para a mais
 * antiga), servido do Redis.
 *
 * Duas propriedades desta rota importam para o front:
 *
 * 1. **Ela funciona com o cache frio.** No miss, o back-end consulta o Influx
 *    e repopula o Redis. Diferente de `/api/sensors/all/:userId`, a query aqui
 *    não tem `group()` antes do `pivot`, então o campo boolean `validity` não
 *    provoca o `schema collision`.
 * 2. **Ela esquenta o cache.** Depois da primeira chamada, a chave
 *    `userId:<userId>:devEUI:<devEUI>:history` existe no Redis e o
 *    `/api/sensors/all/:userId` volta a responder pela trilha de cache hit.
 *
 * Vale registrar: a query de repopulação filtra só por `devEUI`, sem o userId.
 * Então esta rota devolve as leituras do dispositivo mesmo quando ele não está
 * cadastrado sob o usuário que chamou — o userId da URL só compõe a chave do
 * Redis. É o que faz o `2026-tcc-cmd03` aparecer no painel hoje, antes de o
 * devEUI ser associado ao `sub` na tabela `users` do Supabase.
 */
export const fetchSensorLatestCache = async (
  userId: string,
  devEUI: string,
  accessToken: string,
): Promise<LatestMessage[]> => {
  const path = `/api/sensors/latest/${encodeURIComponent(userId)}/${encodeURIComponent(devEUI)}`;
  const messages = await api<LatestMessage[] | null>(path, { accessToken });
  return messages ?? [];
};
