import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ROUTES } from "@/shared/constants/routes";

export const LandingPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    } else {
      loginWithRedirect({ appState: { returnTo: ROUTES.DASHBOARD } });
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
        <span className="text-lg font-bold text-foreground">SmartFarm</span>
        <button
          onClick={handleLogin}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          Entrar
        </button>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Landing Page</h1>
        {isLoading && <p className="text-sm text-muted-foreground">Auth0 carregando...</p>}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Erro Auth0:</p>
            <p>{error.message}</p>
          </div>
        )}
      </main>
    </div>
  );
};
