import { useAuth0 } from "@auth0/auth0-react";

// Claim customizada injetada no ID token pela Action post-login do Auth0
// (vem do app_metadata.userId do usuário).
const USER_ID_CLAIM = "https://smartfarm-api/userId";

const FALLBACK_USER_ID = "fazenda1";

export const useUserId = () => {
  const { user, isAuthenticated } = useAuth0();
  const userId = (user?.[USER_ID_CLAIM] as string | undefined) ?? FALLBACK_USER_ID;
  return { userId, isAuthenticated };
};
