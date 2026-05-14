import { ApiError } from "@/shared/api/api-error";

export type ErrorVariant = "generic" | "network" | "notFound" | "server";

export const resolveErrorVariant = (error: unknown): ErrorVariant => {
  if (ApiError.isApiError(error)) {
    if (error.status === 0) return "network";
    if (error.status === 404) return "notFound";
    if (error.status >= 500) return "server";
    return "generic";
  }
  return "generic";
};
