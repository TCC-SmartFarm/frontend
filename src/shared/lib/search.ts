export const normalizeSearchText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

export const matchesSearch = (
  query: string,
  ...fields: Array<string | undefined | null>
): boolean => {
  const q = normalizeSearchText(query);
  if (!q) return true;
  return fields.some((f) => !!f && normalizeSearchText(f).includes(q));
};
