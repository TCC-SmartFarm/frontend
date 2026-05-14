import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./providers/auth-provider";
import { QueryProvider } from "./providers/query-provider";
import { AppRoutes } from "./router";
import { TooltipProvider } from "@/shared/ui/tooltip";

export const App = () => {
  return (
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <AuthProvider>
          <QueryProvider>
            <AppRoutes />
            <Toaster
              position="top-center"
              duration={3000}
              closeButton
              theme="light"
              toastOptions={{
                classNames: {
                  toast: "font-display border border-border bg-white text-fg shadow-md",
                  title: "text-sm font-semibold",
                  description: "text-xs text-fg-muted",
                  closeButton: "border border-border bg-white text-fg-muted hover:text-fg",
                },
              }}
            />
          </QueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};
