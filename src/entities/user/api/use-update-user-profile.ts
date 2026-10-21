import { useMutation } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { ApiError } from "@/shared/api/api-error";
import { useProfileOverrideStore } from "@/shared/stores/profile-override-store";
import {
  MANAGEMENT_SCOPE,
  managementAudience,
  managementUserUrl,
  toUserProfile,
  type Auth0UserProfile,
  type UserProfile,
} from "./fetch-user-profile";

interface UpdateProfilePayload {
  name?: string;
  nickname?: string;
}

export const useUpdateUserProfile = () => {
  const { getAccessTokenSilently, getAccessTokenWithPopup, user } = useAuth0();
  const setOverride = useProfileOverrideStore((s) => s.setOverride);

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
      if (!user?.sub) {
        throw new ApiError(0, null, "Usuário não autenticado");
      }

      // `user_metadata` é o único campo gravável pelo próprio usuário: name,
      // nickname e email na raiz exigem update:users, escopo exclusivo de M2M.
      const managementParams = { audience: managementAudience(), scope: MANAGEMENT_SCOPE };
      let managementToken: string | undefined;
      try {
        managementToken = await getAccessTokenSilently({
          authorizationParams: managementParams,
          timeoutInSeconds: 10,
        });
      } catch {
        // Com refresh tokens, o SDK só renova o token da audience do login
        // (`smartfarm-api`). O da Management API nunca tem refresh token, então
        // o silencioso falha sem nem chegar ao Auth0 (`missing_refresh_token`).
        // O popup pede o token interativamente; precisa sair do clique em
        // Salvar, que ainda está ativo aqui porque a falha acima é imediata.
        managementToken = await getAccessTokenWithPopup({ authorizationParams: managementParams });
      }
      if (!managementToken) {
        throw new ApiError(0, null, "Token da Management API não obtido");
      }

      const response = await fetch(managementUserUrl(user.sub), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${managementToken}`,
        },
        body: JSON.stringify({ user_metadata: payload }),
      });

      const text = await response.text();

      if (!response.ok) {
        let body: unknown = null;
        try {
          body = text ? JSON.parse(text) : null;
        } catch {
          body = text || null;
        }
        throw new ApiError(response.status, body, `Auth0 error ${response.status}`);
      }

      // O PATCH devolve o usuário completo; se vier vazio, monta a partir do
      // que acabou de ser enviado para não perder a atualização otimista.
      const raw: Auth0UserProfile = text
        ? (JSON.parse(text) as Auth0UserProfile)
        : { email: user.email, picture: user.picture, user_metadata: payload };
      return toUserProfile(raw);
    },
    onSuccess: (profile) => {
      if (!user?.sub) return;
      // O ID token só traz o valor novo no próximo login; até lá, vale o que
      // acabou de ser salvo (ver profile-override-store).
      setOverride(user.sub, { name: profile.name, nickname: profile.nickname });
    },
  });
};
