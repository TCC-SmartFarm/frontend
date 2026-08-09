export const userKeys = {
  all: ["user"] as const,
  // O `sub` faz parte da chave: sem ele, um login com outra conta reaproveitaria
  // o cache (gcTime de 30 min) e mostraria o nome do usuário anterior.
  profile: (sub: string) => [...userKeys.all, "profile", sub] as const,
};
