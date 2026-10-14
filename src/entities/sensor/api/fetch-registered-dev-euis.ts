import { supabaseFor } from "@/shared/api/supabase-client";

/**
 * Os devEUIs que o usuário cadastrou, lidos da coluna `devices` da linha dele
 * na tabela `users` — a mesma que o `mqtt-sub` consulta para decidir de quem é
 * cada leitura.
 *
 * Substitui uma lista fixa no código (`KNOWN_DEVICE_EUIS`) que somava o
 * `2026-tcc-cmd03` ao painel de **todo** usuário. Como a `/latest` do
 * api-service filtra o Influx só por devEUI, qualquer conta nova abria com o
 * sensor real de outra pessoa — e a consulta ainda gravava a chave no Redis em
 * nome dela, fazendo a `/all` passar a devolvê-lo também.
 *
 * Um devEUI com `_` no fim está desativado: é a chave liga/desliga que o
 * `findUserId` do `mqtt-sub` respeita (o ILIKE não casa com o sufixo), então o
 * painel respeita também.
 *
 * Lê o formato sem exigir nada: aceita o mapa numerado (`{"1": {...}}`) ou um
 * array, e ignora o que não tiver `devEUI` texto. Diferente do cadastro, aqui
 * não há o que estragar lendo de forma tolerante. Qualquer falha devolve lista
 * vazia — os sensores que chegam pela `/all` continuam aparecendo.
 */
export const fetchRegisteredDevEUIs = async (
  userId: string,
  accessToken: string,
): Promise<string[]> => {
  const supabase = supabaseFor(accessToken);
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("users")
      .select("devices")
      .eq("userId", userId)
      .maybeSingle();
    if (error) throw error;

    const devices: unknown = data?.devices;
    if (!devices || typeof devices !== "object") return [];

    return Object.values(devices as Record<string, unknown>)
      .map((d) =>
        d && typeof d === "object" ? (d as { devEUI?: unknown }).devEUI : undefined,
      )
      .filter((eui): eui is string => typeof eui === "string")
      .map((eui) => eui.trim())
      .filter((eui) => eui !== "" && !eui.endsWith("_"));
  } catch (err) {
    console.warn("[fetchRegisteredDevEUIs] não deu para ler os sensores cadastrados:", err);
    return [];
  }
};
