import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { env } from "@/shared/config/env";
import { ApiError } from "@/shared/api/api-error";

interface UpdateProfilePayload {
  name?: string;
  nickname?: string;
}

export const useUpdateUserProfile = () => {
  const { getAccessTokenSilently, user } = useAuth0();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      if (!user?.sub) {
        throw new ApiError(0, null, "Usuário não autenticado");
      }

      const managementToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: `https://${env.auth0Domain}/api/v2/`,
          scope: "update:current_user_metadata",
        },
      });

      const url = `https://${env.auth0Domain}/api/v2/users/${encodeURIComponent(user.sub)}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${managementToken}`,
        },
        body: JSON.stringify({ user_metadata: payload }),
      });

      if (!response.ok) {
        let body: unknown = null;
        try {
          body = await response.json();
        } catch {
          body = null;
        }
        throw new ApiError(response.status, body, `Auth0 error ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
