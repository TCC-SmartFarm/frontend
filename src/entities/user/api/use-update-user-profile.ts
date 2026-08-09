import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { ApiError } from "@/shared/api/api-error";
import { userKeys } from "./query-keys";
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
  const { getAccessTokenSilently, user } = useAuth0();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload): Promise<UserProfile> => {
      if (!user?.sub) {
        throw new ApiError(0, null, "Usuário não autenticado");
      }

      // `user_metadata` é o único campo gravável pelo próprio usuário: name,
      // nickname e email na raiz exigem update:users, escopo exclusivo de M2M.
      const managementToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: managementAudience(),
          scope: MANAGEMENT_SCOPE,
        },
        timeoutInSeconds: 10,
      });

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
      // Semear o cache em vez de invalidar: invalidar dispararia outro refetch
      // e, com ele, mais um round-trip de silent auth por iframe.
      qc.setQueryData(userKeys.profile(user.sub), profile);
    },
  });
};
