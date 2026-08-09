import { createJSONStorage } from "zustand/middleware";

/**
 * Ponto ÚNICO de troca da persistência de preferências do usuário (limites de
 * referência, apelidos de sensores). Hoje é localStorage; quando as credenciais
 * do Supabase existirem, basta devolver daqui um `StateStorage` que faça
 * select/upsert numa tabela `user_preferences` — nenhuma store precisa mudar.
 *
 * O `StateStorage` do zustand já aceita implementação assíncrona
 * (`getItem`/`setItem`/`removeItem` podem devolver Promise), então a migração
 * não muda a assinatura. Dois pontos a tratar quando isso acontecer:
 *
 * 1. Hidratação passa a ser assíncrona → o primeiro paint usa os defaults e
 *    depois troca. Mitigar com `store.persist.onFinishHydration` / `hasHydrated`
 *    para segurar a UI que depende dos valores.
 * 2. As chaves abaixo NÃO são escopadas por usuário — duas contas no mesmo
 *    navegador compartilham preferências. Com o Supabase o escopo passa a ser a
 *    linha do usuário e o problema some.
 */
export const preferencesStorage = <T>() => createJSONStorage<T>(() => localStorage);

export const PREFERENCES_KEYS = {
  thresholds: "smartfarm:thresholds",
  sensorNicknames: "smartfarm:sensor-nicknames",
} as const;
