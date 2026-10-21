import { env } from "@/shared/config/env";

/**
 * Escopos "do próprio usuário" da Management API — os únicos que um SPA consegue
 * obter. Hoje só a gravação do perfil usa a Management API (via popup); a
 * leitura sai das claims do ID token.
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
