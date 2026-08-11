import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { env } from "@/shared/config/env";

/**
 * Guarda contra redirecionamentos repetidos. O react-query repete a query que
 * falhou, e sem isto cada tentativa dispararia um `loginWithRedirect` — o que
 * produzia um vai-e-volta entre a landing e o dashboard. Fica no escopo do
 * módulo porque precisa sobreviver às tentativas; como o redirecionamento sai
 * da página, não há o que reverter.
 */
let redirecionandoParaLogin = false;

export const useAuthToken = () => {
  const { getAccessTokenSilently, loginWithRedirect, isAuthenticated } = useAuth0();

  const getToken = useCallback(async (): Promise<string> => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: {
          audience: env.auth0Audience,
        },
      });
    } catch (err) {
      // Sessão do Auth0 expirada: a renovação silenciosa falha e o usuário
      // precisa logar de novo.
      const code = (err as { error?: string })?.error;
      if ((code === "login_required" || code === "consent_required") && !redirecionandoParaLogin) {
        redirecionandoParaLogin = true;
        await loginWithRedirect({
          appState: { returnTo: window.location.pathname },
        });
      }
      throw err;
    }
  }, [getAccessTokenSilently, loginWithRedirect]);

  return { getToken, isAuthenticated };
};
