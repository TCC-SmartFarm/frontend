import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { LoadingIndicator } from "@/shared/ui/loading-indicator";
import { ROUTES } from "@/shared/constants/routes";

/**
 * Tela mostrada enquanto o Auth0 conclui o login.
 *
 * É para onde o `redirect_uri` aponta. Antes ele apontava para a raiz, o que
 * fazia a landing piscar entre o provedor e o painel. Aqui não há navegação
 * própria: o `onRedirectCallback` do AuthProvider é quem leva ao destino assim
 * que a troca de código por token termina. Esta página só cobre o intervalo.
 *
 * O indicador é o mesmo do overlay do dashboard, na mesma posição — a rota
 * troca sem que o usuário perceba, e só a mensagem avança.
 */
export const CallbackPage = () => {
  const { isAuthenticated, error } = useAuth0();

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-alert-bg">
          <AlertTriangle size={24} strokeWidth={1.75} className="text-alert-fg" aria-hidden />
        </div>
        <h1 className="font-display text-xl font-bold text-fg">Não foi possível entrar</h1>
        <p className="max-w-sm text-sm text-fg-muted">{error.message}</p>
        <Link
          to={ROUTES.LANDING}
          className="mt-2 rounded-xl bg-leaf-700 px-5 py-2.5 font-display text-[13px] font-semibold text-white transition-colors hover:bg-leaf-600"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  // Autenticado significa que o token já chegou e a navegação está a caminho;
  // trocar a mensagem aqui evita a sensação de tela parada nesse último instante.
  const message = isAuthenticated ? "Preparando seu painel" : "Verificando sua conta";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg/95 backdrop-blur-sm">
      <LoadingIndicator message={message} />
    </div>
  );
};
