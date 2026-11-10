import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compareAnchors } from "../../shared/order.ts";
import { type Database, openDatabase } from "../db.ts";
import type { NewAnchor } from "./repository.ts";

const work: NewAnchor = {
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

describe("anchor repository", () => {
  let tmp: string;
  let db: Database;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "routinely-anchors-"));
    db = openDatabase(join(tmp, "routinely.db"));
  });

  afterEach(() => {
    db.close();
    rmSync(tmp, { recursive: true, force: true });
  });

  it("lists nothing in a fresh database", () => {
    expect(db.anchors.list()).toEqual([]);
  });

  it("creates an anchor with a new id and lists it", () => {
    const created = db.anchors.create(work);

    const { id, ...fields } = created;
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(fields).toEqual(work);
    expect(db.anchors.list()).toEqual([created]);
  });

  it("gives each created anchor its own id", () => {
    const a = db.anchors.create(work);
    const b = db.anchors.create({ ...work, days: [6] });

    expect(a.id).not.toBe(b.id);
  });

  it("gets a stored anchor by id and nothing for an unknown id", () => {
    const created = db.anchors.create(work);

    expect(db.anchors.get(created.id)).toEqual(created);
    expect(db.anchors.get("nope")).toBeUndefined();
  });

  it("returns days as numbers, as stored", () => {
    const created = db.anchors.create({ ...work, days: [0, 6] });

    const [listed] = db.anchors.list();
    expect(listed.days).toEqual([0, 6]);
    expect(db.anchors.get(created.id)?.days).toEqual([0, 6]);
  });

  it("lists by start time, then by name ignoring case", () => {
    db.anchors.create({ ...work, name: "lunch", start: 720, end: 780 });
    db.anchors.create({ ...work, name: "Work", start: 540, end: 600 });
    db.anchors.create({ ...work, name: "beta", start: 720, end: 780 });
    db.anchors.create({ ...work, name: "Alpha", start: 720, end: 780 });

    expect(db.anchors.list().map((a) => a.name)).toEqual([
      "Work",
      "Alpha",
      "beta",
      "lunch",
    ]);
  });

  it("lists anchors at the same start in the same order as the shared comparator", () => {
    // Four names that tie ignoring case: only the id can order them.
    const names = ["read", "Run", "Ana", "ana", "ANA", "aNa"];
    const created = names.map((name) => db.anchors.create({ ...work, name }));

    expect(db.anchors.list()).toEqual([...created].sort(compareAnchors));
  });

  it("replaces every field of a stored anchor", () => {
    const created = db.anchors.create(work);
    const changed: NewAnchor = {
      name: "Office",
      days: [0, 3],
      start: 600,
      end: 1020,
    };

    const replaced = db.anchors.replace(created.id, changed);

    expect(replaced).toEqual({ id: created.id, ...changed });
    expect(db.anchors.list()).toEqual([{ id: created.id, ...changed }]);
  });

  it("replaces nothing for an unknown id", () => {
    const created = db.anchors.create(work);

    expect(db.anchors.replace("nope", { ...work, name: "Other" })).toBe(
      undefined,
    );
    expect(db.anchors.list()).toEqual([created]);
  });

  it("removes a stored anchor once", () => {
    const created = db.anchors.create(work);
    const kept = db.anchors.create({ ...work, days: [6] });

    expect(db.anchors.remove(created.id)).toBe(true);
    expect(db.anchors.remove(created.id)).toBe(false);
    expect(db.anchors.list()).toEqual([kept]);
  });
});
