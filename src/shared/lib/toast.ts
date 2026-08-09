import { toast, type ExternalToast } from "sonner";

export const showToast = {
  info: (msg: string, opts?: ExternalToast) => toast(msg, opts),
  success: (msg: string, opts?: ExternalToast) => toast.success(msg, opts),
  error: (msg: string, opts?: ExternalToast) => toast.error(msg, opts),
  warning: (msg: string, opts?: ExternalToast) => toast.warning(msg, opts),
};
