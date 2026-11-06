import { HealthResponse } from "../../shared/health.ts";

export type HealthResult =
  { kind: "response"; status: number; body: unknown } | { kind: "failed" };

export type HealthView = {
  server: "connected" | "unreachable";
  db: "connected" | "unreachable";
};

export function toHealthView(result: HealthResult): HealthView {
  if (result.kind === "failed") {
    return { server: "unreachable", db: "unreachable" };
  }
  const parsed = HealthResponse.safeParse(result.body);
  const dbOk =
    result.status === 200 && parsed.success && parsed.data.db === "ok";
  return { server: "connected", db: dbOk ? "connected" : "unreachable" };
}
