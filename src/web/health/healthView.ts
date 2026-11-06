import { HealthResponse } from "../../shared/health.ts";

export type HealthResult =
  { kind: "response"; status: number; body: unknown } | { kind: "failed" };

export type HealthView = {
  server: "connected" | "unreachable";
  db: "connected" | "unreachable";
};

export function toHealthView(result: HealthResult): HealthView {
  // Our API only answers 200 or 503. Any other status (a proxy's 502 or 504
  // while the API is down) means the request never reached it.
  if (
    result.kind === "failed" ||
    (result.status !== 200 && result.status !== 503)
  ) {
    return { server: "unreachable", db: "unreachable" };
  }
  const parsed = HealthResponse.safeParse(result.body);
  const dbOk =
    result.status === 200 && parsed.success && parsed.data.db === "ok";
  return { server: "connected", db: dbOk ? "connected" : "unreachable" };
}
