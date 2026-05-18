import { useAuth0 } from "@auth0/auth0-react";
import { userIdFromEmail } from "./user-id-map";

export const useUserId = () => {
  const { user, isAuthenticated } = useAuth0();
  const userId = userIdFromEmail(user?.email);
  return { userId, isAuthenticated };
};
