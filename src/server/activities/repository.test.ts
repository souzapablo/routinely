import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compareActivities } from "../../shared/order.ts";
import { type Database, openDatabase } from "../db.ts";
import type { NewActivity } from "./repository.ts";

const run: NewActivity = {
  name: "Run 5 km",
  category: "movement",
  timesPerWeek: 2,
  duration: 45,
};

describe("activity repository", () => {
  let tmp: string;
  let db: Database;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "routinely-activities-"));
    db = openDatabase(join(tmp, "routinely.db"));
  });

  afterEach(() => {
    db.close();
    rmSync(tmp, { recursive: true, force: true });
  });

  it("lists nothing in a fresh database", () => {
    expect(db.activities.list()).toEqual([]);
  });

  it("creates an activity with a new id that get finds", () => {
    const created = db.activities.create(run);

    const { id, ...fields } = created;
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(fields).toEqual(run);
    expect(db.activities.get(id)).toEqual(created);
    expect(db.activities.list()).toEqual([created]);
  });

  it("gives each created activity its own id", () => {
    const a = db.activities.create(run);
    const b = db.activities.create(run);

    expect(a.id).not.toBe(b.id);
  });

  it("gets nothing for an unknown id", () => {
    expect(db.activities.get("nope")).toBeUndefined();
  });

  it("replaces every field of a stored activity", () => {
    const created = db.activities.create(run);
    const read: NewActivity = {
      name: "Read",
      category: "rest",
      timesPerWeek: 3,
      duration: 30,
    };

    expect(db.activities.replace(created.id, read)).toEqual({
      id: created.id,
      ...read,
    });
    expect(db.activities.get(created.id)).toEqual({ id: created.id, ...read });
  });

  it("replaces nothing for an unknown id", () => {
    const created = db.activities.create(run);

    expect(db.activities.replace("nope", { ...run, name: "Swim" })).toBe(
      undefined,
    );
    expect(db.activities.list()).toEqual([created]);
  });

  it("removes a stored activity", () => {
    const created = db.activities.create(run);
    const kept = db.activities.create({ ...run, name: "Read" });

    expect(db.activities.remove(created.id)).toBe(true);
    expect(db.activities.list()).toEqual([kept]);
  });

  it("removes nothing for an unknown id", () => {
    const created = db.activities.create(run);

    expect(db.activities.remove("nope")).toBe(false);
    expect(db.activities.list()).toEqual([created]);
  });

  it("lists in the same order as the shared comparator", () => {
    const names = ["read", "Run", "apple", "Ana", "ana", "Écrire", "zebra"];
    const created = names.map((name) => db.activities.create({ ...run, name }));

    expect(db.activities.list()).toEqual([...created].sort(compareActivities));
  });
});
