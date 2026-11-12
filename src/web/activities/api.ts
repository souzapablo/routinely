import { z } from "zod";
import {
  CATEGORIES,
  type ActivityInput,
  type ActivityProblemCode,
} from "../../shared/activities.ts";
import type { FlexibleActivity } from "../../shared/planner.ts";

export type SaveResult =
  | { kind: "ok"; activity: FlexibleActivity }
  | { kind: "rule"; problem: { code: ActivityProblemCode } }
  | { kind: "notFound" }
  | { kind: "failed" };

export type DeleteResult =
  { kind: "ok" } | { kind: "notFound" } | { kind: "failed" };

const StoredActivity = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(CATEGORIES),
  timesPerWeek: z.number().int(),
  duration: z.number().int(),
});

const Problem = z.object({
  code: z.enum([
    "nameEmpty",
    "nameTooLong",
    "timesOutOfRange",
    "durationNotAllowed",
    "categoryUnknown",
  ]),
});

const path = (id: string) => `/api/activities/${encodeURIComponent(id)}`;

// A body that isn't JSON reads as null, which every schema here rejects.
async function bodyOf(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export async function loadActivities(
  signal: AbortSignal,
): Promise<FlexibleActivity[] | "failed"> {
  try {
    const response = await fetch("/api/activities", { signal });
    if (response.status !== 200) return "failed";
    const parsed = z.array(StoredActivity).safeParse(await bodyOf(response));
    return parsed.success ? parsed.data : "failed";
  } catch {
    return "failed";
  }
}

export async function saveActivity(
  id: string | null,
  body: ActivityInput,
): Promise<SaveResult> {
  try {
    const response = await fetch(id === null ? "/api/activities" : path(id), {
      method: id === null ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const { status } = response;
    if (status === 404) return { kind: "notFound" };
    if (status === 200 || status === 201) {
      const parsed = StoredActivity.safeParse(await bodyOf(response));
      return parsed.success
        ? { kind: "ok", activity: parsed.data }
        : { kind: "failed" };
    }
    if (status === 400) {
      const parsed = Problem.safeParse(await bodyOf(response));
      return parsed.success
        ? { kind: "rule", problem: parsed.data }
        : { kind: "failed" };
    }
    return { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}

export async function deleteActivity(id: string): Promise<DeleteResult> {
  try {
    const response = await fetch(path(id), { method: "DELETE" });
    if (response.status === 204) return { kind: "ok" };
    if (response.status === 404) return { kind: "notFound" };
    return { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}
