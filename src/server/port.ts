export const defaultPort = 3000;

// An empty PORT (common in .env files) means "not set", not port 0, which
// would make the OS pick a random port.
export function portFrom(value: string | undefined): number {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? defaultPort : Number(trimmed);
}
