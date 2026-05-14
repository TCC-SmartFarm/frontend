export const readingKeys = {
  all: ["readings"] as const,
  history: (deviceId: string) => [...readingKeys.all, "history", deviceId] as const,
};
