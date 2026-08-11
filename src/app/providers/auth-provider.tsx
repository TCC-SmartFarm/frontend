import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { env } from "@/shared/config/env";
import { ROUTES } from "@/shared/constants/routes";
import type { AppState } from "@auth0/auth0-react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo || ROUTES.DASHBOARD, { replace: true });
  };

  return (
    <Auth0Provider
      domain={env.auth0Domain}
      clientId={env.auth0ClientId}
      cacheLocation="localstorage"
      // Sem refresh tokens, a renovação silenciosa depende de um iframe com
      // cookies de terceiros — que o Firefox bloqueia por padrão. Ali o
      // getAccessTokenSilently falha com `login_required` e manda o usuário
      // para o login no meio da sessão. Exige "Allow Offline Access" ligado
      // na API dentro do Auth0.
      useRefreshTokens={true}
      useRefreshTokensFallback={false}
      authorizationParams={{
        // Rota dedicada em vez da raiz: com a raiz, o Auth0 devolvia o usuário
        // na landing e só depois o SDK navegava para o dashboard, fazendo a
        // landing piscar no meio do login.
        redirect_uri: `${window.location.origin}${ROUTES.CALLBACK}`,
        ...(env.auth0Audience ? { audience: env.auth0Audience } : {}),
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
