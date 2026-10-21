import { supabaseFor } from "@/shared/api/supabase-client";

/** Um sensor cadastrado pelo usuário, com a posição gravada no cadastro. */
export interface RegisteredDevice {
  devEUI: string;
  latitude: number | null;
  longitude: number | null;
}

// `lat`/`lon` chegam como número ou texto, conforme quem gravou (app mobile ou
// este front). O cadastro feito pelo front grava 0/0 enquanto não há tela de
// posição, e 0,0 é o meio do Atlântico — então conta como "sem posição".
const toCoordinate = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n !== 0 ? n : null;
};

/**
 * Os sensores que o usuário cadastrou, lidos da coluna `devices` da linha dele
 * na tabela `users` — a mesma que o `mqtt-sub` consulta para decidir de quem é
 * cada leitura.
 *
 * Substitui uma lista fixa no código (`KNOWN_DEVICE_EUIS`) que somava o
 * `2026-tcc-cmd03` ao painel de **todo** usuário. Como a `/latest` do
 * api-service filtra o Influx só por devEUI, qualquer conta nova abria com o
 * sensor real de outra pessoa — e a consulta ainda gravava a chave no Redis em
 * nome dela, fazendo a `/all` passar a devolvê-lo também.
 *
 * Traz também a posição (`lat`/`lon`). É o ÚNICO lugar onde ela existe: o
 * payload LoRa de 15 bytes não tem GPS e nenhuma rota da API devolve
 * coordenada. Sem isto o sensor real fica "sem GPS" e sem pin no mapa.
 *
 * Um devEUI com `_` no fim está desativado: é a chave liga/desliga que o
 * `findUserId` do `mqtt-sub` respeita, então o painel respeita também.
 *
 * Lê o formato sem exigir nada: aceita o mapa numerado (`{"1": {...}}`) ou um
 * array, e ignora o que não tiver `devEUI` texto. Diferente do cadastro, aqui
 * não há o que estragar lendo de forma tolerante. Qualquer falha devolve lista
 * vazia — os sensores que chegam pela `/all` continuam aparecendo.
 */
export const fetchRegisteredDevices = async (
  userId: string,
  accessToken: string,
): Promise<RegisteredDevice[]> => {
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

    return Object.values(devices as Record<string, unknown>).flatMap((d) => {
      if (!d || typeof d !== "object") return [];
      const { devEUI, lat, lon } = d as { devEUI?: unknown; lat?: unknown; lon?: unknown };
      if (typeof devEUI !== "string") return [];
      const eui = devEUI.trim();
      if (eui === "" || eui.endsWith("_")) return [];
      return [{ devEUI: eui, latitude: toCoordinate(lat), longitude: toCoordinate(lon) }];
    });
  } catch (err) {
    console.warn("[fetchRegisteredDevices] não deu para ler os sensores cadastrados:", err);
    return [];
  }
};
