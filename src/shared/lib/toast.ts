import { useEffect } from "react";
import { toast, type ExternalToast } from "sonner";

export const showToast = {
  info: (msg: string, opts?: ExternalToast) => toast(msg, opts),
  success: (msg: string, opts?: ExternalToast) => toast.success(msg, opts),
  error: (msg: string, opts?: ExternalToast) => toast.error(msg, opts),
  warning: (msg: string, opts?: ExternalToast) => toast.warning(msg, opts),
};

const formatAvailability = (availableDays: number): string => {
  if (availableDays <= 0) return "Sem dados disponíveis";
  if (availableDays === 1) return "Apenas 1 dia de dados disponível.";
  if (availableDays < 30) return `Apenas ${availableDays} dias de dados disponíveis.`;
  const months = Math.floor(availableDays / 30);
  if (months === 1) return "Apenas 1 mês de dados disponível.";
  return `Apenas ${months} meses de dados disponíveis.`;
};

export function useDataAvailabilityToast(
  requestedDays: number,
  availableDays: number | undefined,
  deviceId: string | null,
) {
  useEffect(() => {
    if (!deviceId) return;
    if (availableDays === undefined) return;
    if (availableDays >= requestedDays - 1) return;
    showToast.info(formatAvailability(availableDays), {
      id: `availability-${deviceId}-${requestedDays}`,
    });
  }, [requestedDays, availableDays, deviceId]);
}
