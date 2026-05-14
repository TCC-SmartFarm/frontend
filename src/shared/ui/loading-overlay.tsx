import { Leaf } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export const LoadingOverlay = ({ show, message = "Carregando sensores..." }: LoadingOverlayProps) => (
  <div
    className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center bg-bg/95 backdrop-blur-sm transition-opacity duration-300",
      show ? "opacity-100" : "pointer-events-none opacity-0",
    )}
    aria-hidden={!show}
    role="status"
  >
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        <div className="size-16 animate-spin rounded-full border-4 border-leaf-100 border-t-leaf-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf size={26} strokeWidth={2} className="text-leaf-600" aria-hidden />
        </div>
      </div>
      <p className="font-display text-sm font-semibold text-fg-muted">{message}</p>
    </div>
  </div>
);
