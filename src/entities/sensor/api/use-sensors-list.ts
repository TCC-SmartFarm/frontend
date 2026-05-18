import { useQuery } from "@tanstack/react-query";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { sensorKeys } from "./query-keys";
import { fetchSensorsLatest } from "./fetch-sensors-latest";
import { fetchSensorsLatestFromInflux } from "./fetch-sensors-fallback";
import { adaptLatestToSensors } from "./adapters";

export const useSensorsList = () => {
  const { userId, isAuthenticated } = useUserId();

  return useQuery({
    queryKey: [...sensorKeys.list(), userId],
    queryFn: async () => {
      try {
        const response = await fetchSensorsLatest(userId);
        if (response.leituras && response.leituras.length > 0) {
          return adaptLatestToSensors(response);
        }
      } catch (err) {
        console.warn("[useSensorsList] /all falhou, caindo no influx:", err);
      }
      const fallback = await fetchSensorsLatestFromInflux(userId);
      return adaptLatestToSensors(fallback);
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};
