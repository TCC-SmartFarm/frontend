import { BrowserRouter } from "react-router-dom";
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
          </QueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};
