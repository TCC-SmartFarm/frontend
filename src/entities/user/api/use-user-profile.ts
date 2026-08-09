import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { userKeys } from "./query-keys";
import {
  MANAGEMENT_SCOPE,
  fetchUserProfile,
  managementAudience,
  toUserProfile,
  type UserProfile,
} from "./fetch-user-profile";

/**
 * Perfil do usuário lido da Management API do Auth0.
 *
 * Por que não basta o `user` do ID token: um SPA só consegue escrever em
 * `user_metadata`, e `user_metadata` nunca vira claim raiz do token — nem depois
 * de re-login. Sem esta query, um nome editado jamais apareceria na UI.
 *
 * Este caminho depende de silent auth por iframe (o provider não usa
 * refresh tokens), que Safari/Firefox bloqueiam. Por isso:
 *   - `retry: false`, senão cada falha vira 3 iframes de até 60s;
 *   - `timeoutInSeconds` curto;
 *   - `fallback` para os claims do ID token, tratado como caminho normal e não
 *     como exceção — a UI degrada para o nome do login em vez de quebrar.
 */
export const useUserProfile = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const sub = user?.sub ?? "";

  const fallback: UserProfile = {
    name: user?.name ?? "",
    nickname: user?.nickname ?? "",
    email: user?.email ?? "",
    picture: user?.picture,
  };

  const query = useQuery({
    queryKey: userKeys.profile(sub),
    enabled: isAuthenticated && !!sub,
    staleTime: 30 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<UserProfile> => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: managementAudience(),
          scope: MANAGEMENT_SCOPE,
        },
        timeoutInSeconds: 10,
      });
      return toUserProfile(await fetchUserProfile(sub, token));
    },
  });

  return {
    ...query,
    profile: query.data ?? fallback,
    /** true quando os dados vêm do ID token porque a Management API não respondeu. */
    isFallback: !query.data,
    sub,
  };
};
