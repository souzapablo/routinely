import { expect, type APIRequestContext } from "@playwright/test";

export interface SeedAnchor {
  name: string;
  days: number[];
  start: number;
  end: number;
}

/** The anchors the old example week had. */
export const EXAMPLE_ANCHORS: SeedAnchor[] = [
  { name: "Work", days: [1, 2, 3, 4, 5], start: 540, end: 1080 },
  { name: "Gym class", days: [2, 4], start: 420, end: 480 },
  { name: "Therapy session", days: [3], start: 1140, end: 1200 },
];

/**
 * Leaves exactly `anchors` stored. Every test file shares one database, so
 * tests that read anchors start from this.
 */
export async function resetAnchors(
  request: APIRequestContext,
  anchors: SeedAnchor[],
): Promise<void> {
  const listed = await request.get("/api/anchors");
  expect(listed.status()).toBe(200);
  for (const { id } of (await listed.json()) as { id: string }[]) {
    const deleted = await request.delete(`/api/anchors/${id}`);
    expect(deleted.status()).toBe(204);
  }
  for (const anchor of anchors) {
    const created = await request.post("/api/anchors", { data: anchor });
    expect(created.status()).toBe(201);
  }
}
