import { useQueries } from "@tanstack/react-query";
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
        return "Para recomendar algo precisamos de leituras recentes, e o sensor não enviou nenhuma válida nas últimas 24 horas.";
      }
      if (body.error.startsWith("Supabase")) {
        return "Este sensor ainda não tem localização cadastrada. Sem ela não conseguimos consultar a previsão do tempo da sua região, que é parte importante da recomendação.";
      }
      if (body.error.startsWith("Open-Meteo") || body.error.includes("previsão meteorológica")) {
        return "O serviço de previsão do tempo não respondeu agora.";
      }
      return body.error;
    }
    if (error.status === 0) return "Parece que estamos sem conexão com o servidor.";
  }
  return "Algo não saiu como esperado ao montar a recomendação.";
};

/**
 * Recomendação de irrigação de cada sensor, para a faixa montar o resumo da
 * propriedade. O MSS só responde por sensor, então são N chamadas — cada uma
 * custa três consultas lá dentro (leituras, Supabase e Open-Meteo). O
 * resultado muda devagar, e o cache de 15 minutos segura o custo: com 10
 * sensores são 10 chamadas a cada 15 minutos, não a cada render.
 *
 * O devEUI de cada posição do array devolvido é o da mesma posição de `devEUIs`.
 */
export const useIrrigationList = (devEUIs: string[]) => {
  const { getToken, isAuthenticated } = useAuthToken();
  const { userId } = useUserId();

  return useQueries({
    queries: devEUIs.map((devEUI) => ({
      queryKey: irrigationKeys.detail(devEUI, userId),
      queryFn: async () => fetchIrrigation(userId, devEUI, await getToken()),
      enabled: isAuthenticated && !!userId,
      staleTime: 15 * 60 * 1000,
      retry: 1,
    })),
  });
};
