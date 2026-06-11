import { useQuery } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { sensorKeys } from "./query-keys";
import { fetchSensorsLatest } from "./fetch-sensors-latest";
import { fetchSensorsLatestFromInflux } from "./fetch-sensors-fallback";
import { adaptLatestToSensors } from "./adapters";

export const useSensorsList = () => {
  const { getToken, isAuthenticated } = useAuthToken();
  const { userId } = useUserId();

  return useQuery({
    queryKey: [...sensorKeys.list(), userId],
    queryFn: async () => {
      const token = await getToken();
      try {
        const response = await fetchSensorsLatest(token);
        if (response.leituras && response.leituras.length > 0) {
          return adaptLatestToSensors(response);
        }
      } catch (err) {
        console.warn("[useSensorsList] /all falhou, caindo no influx:", err);
      }
      const fallback = await fetchSensorsLatestFromInflux(userId, token);
      return adaptLatestToSensors(fallback);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};
