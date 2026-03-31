export const sensorKeys = {
  all: ["sensors"] as const,
  list: () => [...sensorKeys.all, "list"] as const,
  detail: (id: string) => [...sensorKeys.all, "detail", id] as const,
  readings: (id: string, param: string, range: string) =>
    [...sensorKeys.detail(id), "readings", param, range] as const,
  latest: (id: string) => [...sensorKeys.detail(id), "latest"] as const,
};
