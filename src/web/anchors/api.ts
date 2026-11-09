import { z } from "zod";
import type { AnchorInput, AnchorProblem } from "../../shared/anchors.ts";
import type { Anchor, DayIndex } from "../../shared/planner.ts";

export type SaveResult =
  | { kind: "ok"; anchor: Anchor }
  | { kind: "rule"; problem: AnchorProblem }
  | { kind: "notFound" }
  | { kind: "failed" };

export type DeleteResult =
  { kind: "ok" } | { kind: "notFound" } | { kind: "failed" };

const Day = z
  .number()
  .int()
  .min(0)
  .max(6)
  .transform((day) => day as DayIndex);

const StoredAnchor = z.object({
  id: z.string(),
  name: z.string(),
  days: z.array(Day),
  start: z.number().int(),
  end: z.number().int(),
});

const Problem = z.union([
  z.object({
    code: z.enum([
      "nameEmpty",
      "nameTooLong",
      "noDays",
      "timesMissing",
      "timeStep",
      "endBeforeStart",
    ]),
  }),
  z.object({ code: z.literal("overlap"), other: z.string(), day: Day }),
]);

const path = (id: string) => `/api/anchors/${encodeURIComponent(id)}`;

// A body that isn't JSON reads as null, which every schema here rejects.
async function bodyOf(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export async function loadAnchors(
  signal: AbortSignal,
): Promise<Anchor[] | "failed"> {
  try {
    const response = await fetch("/api/anchors", { signal });
    if (response.status !== 200) return "failed";
    const parsed = z.array(StoredAnchor).safeParse(await bodyOf(response));
    return parsed.success ? parsed.data : "failed";
  } catch {
    return "failed";
  }
}

export async function saveAnchor(
  id: string | null,
  body: AnchorInput,
): Promise<SaveResult> {
  try {
    const response = await fetch(id === null ? "/api/anchors" : path(id), {
      method: id === null ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const { status } = response;
    if (status === 404) return { kind: "notFound" };
    if (status === 200 || status === 201) {
      const parsed = StoredAnchor.safeParse(await bodyOf(response));
      return parsed.success
        ? { kind: "ok", anchor: parsed.data }
        : { kind: "failed" };
    }
    if (status === 400 || status === 409) {
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

export async function deleteAnchor(id: string): Promise<DeleteResult> {
  try {
    const response = await fetch(path(id), { method: "DELETE" });
    if (response.status === 204) return { kind: "ok" };
    if (response.status === 404) return { kind: "notFound" };
    return { kind: "failed" };
  } catch {
    return { kind: "failed" };
  }
}
