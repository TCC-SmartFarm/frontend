export const readingKeys = {
  all: ["readings"] as const,
  // O userId faz parte da chave: o mesmo devAddr sob outra conta é outro cache.
  history: (devAddr: string, userId: string) =>
    [...readingKeys.all, "history", devAddr, userId] as const,
};
