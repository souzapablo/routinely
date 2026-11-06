import { useEffect, useState } from "react";
import {
  type HealthResult,
  type HealthView,
  toHealthView,
} from "./healthView.ts";

export type HealthState =
  { state: "checking" } | { state: "done"; view: HealthView; checkedAt: Date };

const timeoutMs = 5000;

export function useHealth(): HealthState {
  const [health, setHealth] = useState<HealthState>({ state: "checking" });

  useEffect(() => {
    const controller = new AbortController();
    // A plain setTimeout (not AbortSignal.timeout) so tests can drive it
    // with fake timers.
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // Set by the cleanup. React runs effects twice in development
    // (StrictMode), and a component can unmount mid-request: in both cases
    // the late answer must not update state.
    let ignore = false;

    void checkHealth(controller.signal).then((result) => {
      clearTimeout(timer);
      if (!ignore) {
        setHealth({
          state: "done",
          view: toHealthView(result),
          checkedAt: new Date(),
        });
      }
    });

    return () => {
      ignore = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return health;
}

async function checkHealth(signal: AbortSignal): Promise<HealthResult> {
  try {
    const response = await fetch("/api/health", { signal });
    // A body that isn't JSON still means the server answered;
    // toHealthView rejects it when it checks the schema.
    const body: unknown = await response.json().catch(() => null);
    return { kind: "response", status: response.status, body };
  } catch {
    // Network error, or aborted by the timeout.
    return { kind: "failed" };
  }
}
