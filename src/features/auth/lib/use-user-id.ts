import { useAuth0 } from "@auth0/auth0-react";

/**
 * Identidade do usuário perante o back-end: o `sub` do Auth0.
 *
 * Ele vai **na URL** de todas as rotas de sensores. O api-service da `main`
 * (commit "fix: functional version", 09/09/2026) removeu o authMiddleware e
 * voltou a ler o userId do path — o Bearer token continua sendo enviado, mas
 * é ignorado pelo servidor.
 *
 * Não é mais a claim `https://smartfarm-api/userId`: ela só era escrita no ID
 * token, e o valor dela (`fazenda1`) não corresponde a nenhuma série gravada
 * no InfluxDB.
 */
export const useUserId = () => {
  const { user, isAuthenticated } = useAuth0();
  // String vazia enquanto o SDK carrega; as queries só rodam com isAuthenticated.
  return { userId: user?.sub ?? "", isAuthenticated };
};
