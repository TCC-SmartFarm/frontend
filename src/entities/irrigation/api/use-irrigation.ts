import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/base-api";
import { ApiError } from "@/shared/api/api-error";
import { useAuthToken } from "@/features/auth/lib/use-auth-token";
import { useUserId } from "@/features/auth/lib/use-user-id";
import type { IrrigationResponse } from "../model/types";

export const irrigationKeys = {
  all: ["irrigation"] as const,
  // O userId faz parte da chave: o MSS resolve a localização pelo par userId+devEUI.
  detail: (devEUI: string, userId: string) => [...irrigationKeys.all, devEUI, userId] as const,
};

const fetchIrrigation = (userId: string, devEUI: string, accessToken: string) => {
  const query = new URLSearchParams({ userId, devEUI });
  return api<IrrigationResponse>(`/api/v1/irrigation?${query}`, { accessToken });
};

/**
 * O MSS responde 502 com `{ error }` quando falta algo no caminho — sensor sem
 * leitura nas últimas 24 h, sem lat/lon no Supabase, Open-Meteo fora. A frase
 * dele é específica o bastante para mostrar ao usuário.
 */
export const irrigationErrorMessage = (error: unknown): string => {
  if (ApiError.isApiError(error)) {
    const body = error.body as { error?: unknown } | null;
    if (body && typeof body.error === "string") {
      if (body.error.includes("leitura válida e recente")) {
        return "Para recomendar algo precisamos de leituras recentes, e o sensor não enviou nenhuma válida nas últimas 24 horas. Vale conferir se ele está ligado e com bateria.";
      }
      if (body.error.startsWith("Supabase")) {
        return "Este sensor ainda não tem localização cadastrada. Sem ela não conseguimos consultar a previsão do tempo da sua região, que é parte importante da recomendação.";
      }
      if (body.error.startsWith("Open-Meteo") || body.error.includes("previsão meteorológica")) {
        return "O serviço de previsão do tempo não respondeu agora. Costuma voltar em poucos minutos, então tente de novo daqui a pouco.";
      }
      return body.error;
    }
    if (error.status === 0) return "Parece que estamos sem conexão com o servidor. Confira sua internet e tente de novo.";
  }
  return "Algo não saiu como esperado ao montar a recomendação. Tente novamente em alguns instantes.";
};

/**
 * Recomendação de irrigação de um sensor. Cada chamada custa três consultas no
 * MSS (leituras, Supabase e Open-Meteo) e o resultado muda devagar, então o
 * cache segura 15 minutos.
 */
export const useIrrigation = (devEUI: string | null) => {
  const { getToken, isAuthenticated } = useAuthToken();
  const { userId } = useUserId();

  return useQuery({
    queryKey: irrigationKeys.detail(devEUI ?? "", userId),
    queryFn: async () => fetchIrrigation(userId, devEUI!, await getToken()),
    enabled: isAuthenticated && !!userId && !!devEUI,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
};
