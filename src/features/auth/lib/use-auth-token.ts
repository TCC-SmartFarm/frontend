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
      // precisa logar de novo. `missing_refresh_token` entra junto: com o
      // fallback de iframe desligado, é o que o SDK lança quando o access token
      // venceu e o login não deixou refresh token no cache (Allow Offline Access
      // desligado na API, ou login feito antes de ligá-lo). Só um login novo
      // emite um — sem isto, o cadastro de sensor falhava seco.
      const code = (err as { error?: string })?.error;
      if (
        (code === "login_required" ||
          code === "consent_required" ||
          code === "missing_refresh_token") &&
        !redirecionandoParaLogin
      ) {
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
