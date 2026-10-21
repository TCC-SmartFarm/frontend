import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useProfileOverrideStore } from "@/shared/stores/profile-override-store";
import type { UserProfile } from "./fetch-user-profile";

// Claims que a Action de post-login do Auth0 grava no ID token a partir do
// `user_metadata` — o único lugar onde o usuário consegue editar o próprio nome.
const CLAIM_NAME = "https://smartfarm-api/name";
const CLAIM_NICKNAME = "https://smartfarm-api/nickname";

const claim = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value : undefined;

/**
 * Perfil do usuário a partir do ID token.
 *
 * Antes isto lia a Management API do Auth0, mas o token dela não renova sem
 * popup: só o navegador que salvou via popup enxergava o nome novo, e só até o
 * token expirar. Agora a Action copia `user_metadata.name`/`nickname` para o
 * ID token, que chega em qualquer navegador. Sem a claim (usuário que nunca
 * editou), vale o nome da raiz da conta.
 *
 * Entre salvar e o próximo login, vale o que foi salvo neste navegador
 * (`profile-override-store`).
 */
export const useUserProfile = () => {
  const { user } = useAuth0();
  const sub = user?.sub ?? "";
  const override = useProfileOverrideStore((s) => (sub ? s.bySub[sub] : undefined));
  const clearOverride = useProfileOverrideStore((s) => s.clearOverride);

  const fromToken: UserProfile = {
    name: claim(user?.[CLAIM_NAME]) ?? user?.name ?? "",
    nickname: claim(user?.[CLAIM_NICKNAME]) ?? user?.nickname ?? "",
    email: user?.email ?? "",
    picture: user?.picture,
  };

  // O token já trouxe o que foi salvo: a ponte não é mais necessária.
  const caughtUp =
    !!override && override.name === fromToken.name && override.nickname === fromToken.nickname;
  useEffect(() => {
    if (caughtUp) clearOverride(sub);
  }, [caughtUp, clearOverride, sub]);

  const profile: UserProfile = override ? { ...fromToken, ...override } : fromToken;

  return {
    profile,
    sub,
    // Mantido pela interface de quem consome: o perfil sai do token, que já
    // está disponível quando a página protegida monta.
    isPending: false,
  };
};
