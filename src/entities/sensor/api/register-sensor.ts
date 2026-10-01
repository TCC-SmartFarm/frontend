import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseFor } from "@/shared/api/supabase-client";

/**
 * Cadastro de um sensor sob o usuário autenticado, gravado **direto do front**
 * na tabela `users` do Supabase — a mesma que o `mqtt-sub` consulta para
 * descobrir de quem é cada leitura.
 *
 * Cada usuário tem uma linha (`userId` = `sub` do Auth0, chave primária) e os
 * sensores dele vivem na coluna `devices` (`jsonb`), um objeto com chaves
 * numeradas — `{"1": {...}, "2": {...}}`, formato que já estava gravado na
 * tabela. O `mqtt-sub` da `main` acha o dono com
 * `devices::text ILIKE '%"devEUI": "<eui>"%'`, então o que importa para a
 * ingestão é a chave `devEUI` dentro de cada objeto, não a numeração.
 *
 * O espaço depois dos dois-pontos naquele ILIKE só funciona porque a coluna é
 * `jsonb`: o Postgres reescreve o texto no formato canônico dele, com espaço,
 * qualquer que seja o JSON que o supabase-js mandou. Se um dia virar `json`,
 * o texto fica como chegou e o sensor grava mas nunca é encontrado.
 *
 * `fazendas.devices` e `fazenda_users` existem no banco, mas a ingestão não
 * lê nenhuma das duas — o cadastro vai na conta do usuário.
 */
export interface SensorRegistration {
  devEUI: string;
  appEUI: string;
  appKey: string;
}

/**
 * O objeto que vai para dentro de `devices`. Os três últimos campos ainda não
 * têm origem: data de instalação e posição vão vir do app mobile ou de uma
 * tela própria. Por ora entram zerados. Os nomes `lat`/`lon` seguem os que já
 * estão gravados na tabela, para todo sensor ter o mesmo formato.
 */
export interface RegisteredDevice extends SensorRegistration {
  setup_date: number;
  lat: number;
  lon: number;
}

export type SensorRegistrationErrorKind =
  | "nao-configurado" // faltam VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
  | "nao-autorizado" // JWT recusado ou RLS barrou
  | "duplicado" // este devEUI já está na lista do usuário
  | "formato-desconhecido" // `devices` tem um formato que não sabemos estender
  | "falha";

export class SensorRegistrationError extends Error {
  readonly kind: SensorRegistrationErrorKind;
  readonly cause?: unknown;

  constructor(kind: SensorRegistrationErrorKind, message: string, cause?: unknown) {
    super(message);
    this.name = "SensorRegistrationError";
    this.kind = kind;
    this.cause = cause;
  }

  static is(error: unknown): error is SensorRegistrationError {
    return error instanceof SensorRegistrationError;
  }
}

// 42501 = insufficient_privilege (RLS). PGRST301/PGRST302 = JWT ausente ou
// inválido — é o que volta enquanto o Third-Party Auth do Auth0 não estiver
// ligado no Supabase.
const CODIGOS_DE_AUTORIZACAO = new Set(["42501", "PGRST301", "PGRST302"]);

const traduzir = (erro: PostgrestError, contexto: string): SensorRegistrationError =>
  CODIGOS_DE_AUTORIZACAO.has(erro.code)
    ? new SensorRegistrationError("nao-autorizado", `${contexto}: ${erro.message}`, erro)
    : new SensorRegistrationError("falha", `${contexto}: ${erro.message}`, erro);

type DevicesMap = Record<string, Record<string, unknown>>;

/**
 * Lê a coluna `devices` como o mapa numerado, sem nunca descartar o que já
 * existe.
 *
 * Nulo e `{}` (o que o `api-service` da `mudancas-breno` grava ao criar a
 * linha) viram mapa vazio. Qualquer outra coisa — um array, ou o mapa
 * `devEUI -> devAddr` de uma versão antiga — é recusada: regravar por cima
 * apagaria sensores de verdade.
 */
const comoMapa = (devices: unknown): DevicesMap => {
  if (devices == null) return {};
  if (typeof devices === "object" && !Array.isArray(devices)) {
    const valores = Object.values(devices as Record<string, unknown>);
    if (valores.every((v) => typeof v === "object" && v !== null && !Array.isArray(v))) {
      return devices as DevicesMap;
    }
  }
  throw new SensorRegistrationError(
    "formato-desconhecido",
    `Formato inesperado da coluna devices: ${JSON.stringify(devices)}`,
  );
};

// Próximo número livre depois do maior já usado. Não é `length + 1`: se o
// sensor "2" de três for removido, `length + 1` devolveria "3" e sobrescreveria
// o que já está lá.
const proximaChave = (mapa: DevicesMap): string => {
  const numeros = Object.keys(mapa).map(Number).filter(Number.isInteger);
  return String(numeros.length ? Math.max(...numeros) + 1 : 1);
};

export const registerSensor = async (
  userId: string,
  registration: SensorRegistration,
  accessToken: string,
): Promise<RegisteredDevice> => {
  const supabase = supabaseFor(accessToken);
  if (!supabase) {
    throw new SensorRegistrationError(
      "nao-configurado",
      "VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY ausente",
    );
  }

  const novo: RegisteredDevice = {
    ...registration,
    setup_date: 0,
    lat: 0,
    lon: 0,
  };

  // Ler-modificar-gravar, e não um append atômico: o PostgREST não tem
  // operador para concatenar num jsonb sem uma função RPC no banco. A janela
  // de corrida é a de um mesmo usuário cadastrando dois sensores ao mesmo
  // tempo em duas abas — aceitável aqui.
  const { data: linha, error: erroLeitura } = await supabase
    .from("users")
    .select("devices")
    .eq("userId", userId)
    .maybeSingle();
  if (erroLeitura) throw traduzir(erroLeitura, "Leitura do cadastro falhou");

  const atuais = comoMapa(linha?.devices);
  // O `mqtt-sub` compara com ILIKE, então maiúscula e minúscula são o mesmo
  // sensor. Um devEUI com `_` no fim (desativado) não conta como duplicado.
  const euiNovo = novo.devEUI.toLowerCase();
  if (Object.values(atuais).some((d) => String(d.devEUI ?? "").toLowerCase() === euiNovo)) {
    throw new SensorRegistrationError("duplicado", `devEUI ${novo.devEUI} já cadastrado`);
  }
  const devices: DevicesMap = { ...atuais, [proximaChave(atuais)]: { ...novo } };

  // `.select()` pede a linha de volta. Sem isso, um UPDATE que o RLS filtrou
  // responde 204 e parece sucesso sem ter gravado nada.
  const { data: gravadas, error: erroEscrita } = linha
    ? await supabase.from("users").update({ devices }).eq("userId", userId).select("userId")
    : await supabase.from("users").insert({ userId, devices }).select("userId");
  if (erroEscrita) throw traduzir(erroEscrita, "Gravação do cadastro falhou");
  if (!gravadas || gravadas.length === 0) {
    throw new SensorRegistrationError(
      "nao-autorizado",
      "Nenhuma linha gravada — o RLS provavelmente filtrou a escrita",
    );
  }

  return novo;
};
