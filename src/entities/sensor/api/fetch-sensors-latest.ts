import { api } from "@/shared/api/base-api";
import type { SensorPayload } from "../model/types";

export interface LatestMessage {
  userId: string;
  applicationId?: string;
  deviceType?: string;
  devEUI: string;
  devAddr?: string;
  /**
   * Nome antigo do identificador, usado pelo mqtt-sub que lia do broker
   * próprio. O envelope do network server chama o mesmo campo de `devEUI`.
   */
  deviceId?: string;
  name?: string;
  payload: Partial<SensorPayload> & {
    name?: string;
    latitude?: string | number | null;
    longitude?: string | number | null;
    timestamp?: number;
  };
}

export interface LatestResponse {
  leituras: LatestMessage[];
  total_dispositivos: number;
  /**
   * A `main` devolve `userId`; a versão com JWT devolvia `usuario`. Os dois
   * ficam opcionais porque o front não depende de nenhum dos dois — a
   * identidade ele já tem, é o que ele mandou na URL.
   */
  userId?: string;
  usuario?: string;
}

/**
 * Última leitura de cada sensor do usuário.
 *
 * Serve do Redis quando há cache; com o cache frio o back-end repopula a
 * partir do InfluxDB. Essa segunda trilha tem duas falhas conhecidas, e é por
 * isso que use-sensors-list trata erro aqui como "tenta a outra rota":
 *
 * - **404** quando não existe leitura nenhuma para o userId (conta nova)
 * - **500** quando existe: o `group()` antes do `pivot` junta séries float e
 *   boolean na mesma tabela e o Influx recusa com `schema collision`. O campo
 *   `validity` do payload LoRa é boolean, então isso acontece sempre que o
 *   dispositivo real aparece sob o usuário.
 */
export const fetchSensorsLatest = (userId: string, accessToken: string) =>
  api<LatestResponse>(`/api/sensors/all/${encodeURIComponent(userId)}`, { accessToken });
