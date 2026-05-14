import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { sensorKeys } from "./query-keys";
import { fetchSensorsLatest } from "./fetch-sensors-latest";
import { adaptLatestToSensors } from "./adapters";

export const useSensorsList = () => {
  const { getToken, isAuthenticated } = useAuthToken();

  return useQuery({
    queryKey: sensorKeys.list(),
    queryFn: async () => {
      const token = await getToken();
      const response = await fetchSensorsLatest(token);
      return adaptLatestToSensors(response);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};
