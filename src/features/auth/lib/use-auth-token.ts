import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { env } from "@/shared/config/env";

export const useAuthToken = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getToken = useCallback(async (): Promise<string> => {
    return getAccessTokenSilently({
      authorizationParams: {
        audience: env.auth0Audience,
      },
    });
  }, [getAccessTokenSilently]);

  return { getToken, isAuthenticated };
};
