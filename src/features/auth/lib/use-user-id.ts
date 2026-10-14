import { useAuth0 } from "@auth0/auth0-react";
import { useQuery } from "@tanstack/react-query";
import { supabaseFor } from "@/shared/api/supabase-client";
import { useAuthToken } from "./use-auth-token";

/**
 * Tira o provedor do `sub` do Auth0: `auth0|69cb…` → `69cb…`.
 *
 * Corta no pipe, e não num número fixo de caracteres: `auth0|` tem 6, mas um
 * login social chega como `google-oauth2|1234…`, e cortar 6 deixaria
 * `e-oauth2|1234…`. Sem pipe, devolve o valor inteiro.
 */
export const stripIdentityProvider = (sub: string): string =>
  sub.slice(sub.indexOf("|") + 1);

/**
 * Decide qual id o usuário usa perante o back-end.
 *
 * Usuários novos usam o `sub` SEM o provedor. Os antigos continuam com o `sub`
 * inteiro enquanto a linha deles na tabela `users` estiver gravada assim — é
 * esse valor que o `mqtt-sub` carimba em cada leitura, então é sob ele que
 * estão as chaves do Redis e as séries do Influx. Trocar só no front deixaria
 * esses usuários com o painel vazio.
 *
 * Quando a linha antiga for renomeada no Supabase, a consulta deixa de achá-la
 * e o usuário passa sozinho para o id novo, sem outro deploy do front.
 *
 * Qualquer falha cai no `sub` inteiro, que é o comportamento de antes: para um
 * usuário antigo é o id certo, e um novo não tem dado nenhum a perder — nem
 * consegue cadastrar sensor, já que o cadastro depende do mesmo Supabase.
 */
const resolveUserId = async (sub: string, getToken: () => Promise<string>): Promise<string> => {
  const semProvedor = stripIdentityProvider(sub);
  if (semProvedor === sub) return sub;

  try {
    const supabase = supabaseFor(await getToken());
    if (!supabase) return sub;

    const { data, error } = await supabase
      .from("users")
      .select("userId")
      .eq("userId", sub)
      .limit(1);
    if (error) throw error;

    return data.length > 0 ? sub : semProvedor;
  } catch (err) {
    console.warn("[useUserId] não deu para consultar a tabela users; usando o sub inteiro:", err);
    return sub;
  }
};

/**
 * Identidade do usuário perante o back-end. Vai **na URL** de todas as rotas de
 * sensores e na coluna `userId` do cadastro.
 *
 * O api-service da `main` (commit "fix: functional version", 09/09/2026)
 * removeu o authMiddleware e lê o userId do path — o Bearer token continua
 * sendo enviado, mas é ignorado pelo servidor.
 *
 * Não é a claim `https://smartfarm-api/userId`: ela só era escrita no ID token,
 * e o valor dela (`fazenda1`) não corresponde a nenhuma série no InfluxDB.
 *
 * String vazia até a consulta responder: quem consome precisa esperar por um
 * id não vazio, senão dispara requisições sob o id errado.
 */
export const useUserId = () => {
  const { user, isAuthenticated } = useAuth0();
  const { getToken } = useAuthToken();
  const sub = user?.sub ?? "";

  const { data } = useQuery({
    queryKey: ["auth", "user-id", sub],
    queryFn: () => resolveUserId(sub, getToken),
    enabled: isAuthenticated && !!sub,
    // Não muda durante a sessão; a migração de um usuário antigo vale a partir
    // do próximo carregamento da página.
    staleTime: Infinity,
    retry: false,
  });

  return { userId: data ?? "", isAuthenticated };
};
