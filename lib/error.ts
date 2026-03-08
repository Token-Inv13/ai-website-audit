export function getErrorMessage(
  error: unknown,
  fallback = "Internal server error",
): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === "string" && error.trim()) {
    return error
  }

  return fallback
}

export function getApiErrorMessage(
  payload: unknown,
  fallback = "Request failed",
): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.trim()
  ) {
    return payload.error
  }

  return fallback
}
