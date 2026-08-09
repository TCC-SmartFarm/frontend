import { env } from "@/shared/config/env";
import { ApiError } from "@/shared/api/api-error";

/**
 * Escopos "do próprio usuário" da Management API — os únicos que um SPA consegue
 * obter via getAccessTokenSilently. Um único string compartilhado por leitura e
 * escrita de propósito: o SDK cacheia o token por (audience, scope), e pedir
 * escopos diferentes criaria duas entradas e dois round-trips de silent auth.
 */
export const MANAGEMENT_SCOPE =
  "read:current_user read:current_user_metadata update:current_user_metadata";

export const managementAudience = () => `https://${env.auth0Domain}/api/v2/`;

export const managementUserUrl = (sub: string) =>
  `https://${env.auth0Domain}/api/v2/users/${encodeURIComponent(sub)}`;

/** O que a Management API devolve e nos interessa. */
export interface Auth0UserProfile {
  user_id?: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
  user_metadata?: {
    name?: string;
    nickname?: string;
  };
}

/**
 * Perfil efetivo exibido pela UI. `user_metadata` vence os campos raiz porque é
 * o único lugar onde um SPA pode escrever — os claims raiz do ID token ficam
 * congelados no valor original mesmo depois de um PATCH bem-sucedido.
 */
export interface UserProfile {
  name: string;
  nickname: string;
  email: string;
  picture?: string;
}

export const toUserProfile = (raw: Auth0UserProfile): UserProfile => ({
  name: raw.user_metadata?.name ?? raw.name ?? "",
  nickname: raw.user_metadata?.nickname ?? raw.nickname ?? "",
  email: raw.email ?? "",
  picture: raw.picture,
});

export const fetchUserProfile = async (
  sub: string,
  managementToken: string,
): Promise<Auth0UserProfile> => {
  let response: Response;
  try {
    response = await fetch(managementUserUrl(sub), {
      headers: { Authorization: `Bearer ${managementToken}` },
    });
  } catch {
    throw new ApiError(0, null, "Falha de rede ao consultar o perfil");
  }

  if (!response.ok) {
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    throw new ApiError(response.status, body, `Auth0 error ${response.status}`);
  }

  return response.json() as Promise<Auth0UserProfile>;
};
