import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/auth-provider";
import { QueryProvider } from "./providers/query-provider";
import { AppRoutes } from "./router";

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryProvider>
          <AppRoutes />
        </QueryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
