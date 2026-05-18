const EMAIL_TO_USER_ID: Record<string, string> = {
  "brenoamorim11@gmail.com": "fazenda1",
};

const FALLBACK_USER_ID = "fazenda1";

export const userIdFromEmail = (email?: string | null): string => {
  if (!email) return FALLBACK_USER_ID;
  return EMAIL_TO_USER_ID[email.toLowerCase()] ?? FALLBACK_USER_ID;
};

const DEVICE_IDS_BY_USER_ID: Record<string, string[]> = {
  fazenda1: ["1e23456"],
  fazenda2: [],
  fazenda3: [],
};

export const getDeviceIdsForUser = (userId: string): string[] =>
  DEVICE_IDS_BY_USER_ID[userId] ?? [];
