import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/shared/config/env";

/**
 * Cliente do Supabase falando direto do navegador, autenticado com o access
 * token do **Auth0** (Third-Party Auth do Supabase), e não com o Supabase Auth.
 *
 * A chave publishable sozinha não identifica ninguém — ela vai no bundle e
 * qualquer um a lê. Sem o token, toda requisição chega como `anon` e o RLS não
 * tem como distinguir um produtor de outro. Com ele, a policy compara
 * `auth.jwt() ->> 'sub'` com a coluna `userId` e cada um só mexe na própria
 * linha. É o mesmo papel que o authMiddleware do api-service fazia em Go.
 *
 * O Supabase escolhe o papel do Postgres pela claim `role` do token, por isso
 * a Action post-login do Auth0 precisa emitir `role: "authenticated"` no
 * access token — no ID token não adianta.
 */
export const supabaseFor = (accessToken: string): SupabaseClient | null => {
  if (!env.supabaseUrl || !env.supabasePublishableKey) return null;

  // Um cliente por chamada: com `accessToken` o supabase-js desliga o próprio
  // Auth (sem storage, sem refresh), então o cliente é só um wrapper do fetch.
  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    accessToken: async () => accessToken,
  });
};
