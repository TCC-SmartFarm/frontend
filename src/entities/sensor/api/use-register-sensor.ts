import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import { sensorKeys } from "./query-keys";
import { registerSensor, type SensorRegistration } from "./register-sensor";

export const useRegisterSensor = () => {
  const { getToken } = useAuthToken();
  const { userId } = useUserId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registration: SensorRegistration) => {
      const token = await getToken();
      return registerSensor(userId, registration, token);
    },
    onSuccess: () => {
      // Invalida a lista inteira, e não só uma entrada: o sensor recém-cadastrado
      // só aparece depois que a ingestão associar o devEUI ao usuário, então não
      // há o que inserir no cache local — o que existe é uma lista desatualizada.
      queryClient.invalidateQueries({ queryKey: sensorKeys.list() });
    },
  });
};
