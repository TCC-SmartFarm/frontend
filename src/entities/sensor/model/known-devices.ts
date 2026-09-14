/**
 * Dispositivos que o front consulta um a um quando a rota
 * `/api/sensors/all/:userId` não responde.
 *
 * Existia um cadastro para isso — `GET /api/sensors/devices`, que lia a tabela
 * `users` do Supabase. A rota saiu do back-end junto com o authMiddleware no
 * commit "fix: functional version" (09/09/2026), e sem ela o front não tem
 * como descobrir sozinho quais devEUIs existem.
 *
 * **Sensor novo entra aqui.** Se o cadastro voltar, esta lista pode sumir e o
 * fallback volta a se alimentar do back-end.
 */
export const KNOWN_DEVICE_EUIS: readonly string[] = [
  // 2026-tcc-cmd03 — o dispositivo LoRa real, via networkserver2.maua.br.
  "5e76ce4fd99eefe3",
];
