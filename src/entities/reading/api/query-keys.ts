export const readingKeys = {
  all: ["readings"] as const,
  // O userId faz parte da chave: o mesmo devEUI sob outra conta é outro cache.
  history: (devEUI: string, userId: string) =>
    [...readingKeys.all, "history", devEUI, userId] as const,
};
