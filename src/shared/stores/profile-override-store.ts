import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProfileOverride {
  name: string;
  nickname: string;
}

interface ProfileOverrideState {
  /** sub do Auth0 → nome/apelido salvos neste navegador e ainda não vistos no token. */
  bySub: Record<string, ProfileOverride>;
  setOverride: (sub: string, value: ProfileOverride) => void;
  clearOverride: (sub: string) => void;
}

/**
 * Ponte entre salvar o perfil e o token de login trazer o valor novo.
 *
 * O nome editado vai para o `user_metadata` do Auth0, e a Action de post-login
 * o copia para o ID token — mas só num login novo: a sessão não tem refresh
 * token para renovar o ID token sem sair e entrar. Sem esta ponte, quem salva
 * veria o nome antigo de volta ao recarregar a página.
 *
 * É apagada sozinha (`useUserProfile`) quando o token passa a trazer o mesmo
 * valor, então não fica sobrepondo o Auth0 para sempre.
 */
export const useProfileOverrideStore = create<ProfileOverrideState>()(
  persist(
    (set) => ({
      bySub: {},
      setOverride: (sub, value) => set((s) => ({ bySub: { ...s.bySub, [sub]: value } })),
      clearOverride: (sub) =>
        set((s) => {
          const next = { ...s.bySub };
          delete next[sub];
          return { bySub: next };
        }),
    }),
    { name: "smartfarm:profile-override" },
  ),
);
