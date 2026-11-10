import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openDatabase } from "./db.ts";
import { migrate, migrations } from "./migrations.ts";

function userVersion(sqlite: DatabaseSync): number {
  const row = sqlite.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };
  return row.user_version;
}

function tableNames(sqlite: DatabaseSync): string[] {
  const rows = sqlite
    .prepare(
      "SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name",
    )
    .all() as { name: string }[];
  return rows.map((row) => row.name);
}

describe("migrations", () => {
  let tmp: string;
  let path: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "routinely-migrate-"));
    path = join(tmp, "routinely.db");
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("brings a fresh file to version 2 with the anchors and activities tables", () => {
    openDatabase(path).close();

    const sqlite = new DatabaseSync(path);
    expect(userVersion(sqlite)).toBe(migrations.length);
    expect(migrations.length).toBe(2);
    expect(tableNames(sqlite)).toEqual(["activities", "anchors"]);
    const columns = sqlite.prepare("PRAGMA table_info(anchors)").all() as {
      name: string;
    }[];
    expect(columns.map((c) => c.name)).toEqual([
      "id",
      "name",
      "days",
      "start",
      "end",
    ]);
    sqlite.close();
  });

  it("leaves an already-migrated file and its rows as they are", () => {
    openDatabase(path).close();
    const before = new DatabaseSync(path);
    before
      .prepare(
        `INSERT INTO anchors (id, name, days, start, "end") VALUES (?, ?, ?, ?, ?)`,
      )
      .run("a1", "Work", "[1,2,3,4,5]", 540, 1080);
    before.close();

    openDatabase(path).close();

    const after = new DatabaseSync(path);
    expect(userVersion(after)).toBe(2);
    expect(tableNames(after)).toEqual(["activities", "anchors"]);
    expect(after.prepare("SELECT id, name FROM anchors").all()).toEqual([
      { id: "a1", name: "Work" },
    ]);
    after.close();
  });

  it("takes a version-1 file holding anchors to version 2 and keeps them", () => {
    const v1 = new DatabaseSync(path);
    migrate(v1, migrations.slice(0, 1));
    v1.prepare(
      `INSERT INTO anchors (id, name, days, start, "end") VALUES (?, ?, ?, ?, ?)`,
    ).run("a1", "Work", "[1,2,3,4,5]", 540, 1080);
    expect(userVersion(v1)).toBe(1);
    v1.close();

    openDatabase(path).close();

    const after = new DatabaseSync(path);
    expect(userVersion(after)).toBe(2);
    expect(tableNames(after)).toEqual(["activities", "anchors"]);
    expect(
      after.prepare(`SELECT id, name, days, start, "end" FROM anchors`).all(),
    ).toEqual([
      { id: "a1", name: "Work", days: "[1,2,3,4,5]", start: 540, end: 1080 },
    ]);
    const columns = after.prepare("PRAGMA table_info(activities)").all() as {
      name: string;
    }[];
    expect(columns.map((c) => c.name)).toEqual([
      "id",
      "name",
      "category",
      "times_per_week",
      "duration",
    ]);
    after.close();
  });

  describe("the activities table", () => {
    const insert = `INSERT INTO activities (id, name, category, times_per_week, duration)
      VALUES (?, ?, ?, ?, ?)`;

    it("stores a valid row", () => {
      openDatabase(path).close();
      const sqlite = new DatabaseSync(path);
      sqlite.prepare(insert).run("f1", "Run 5 km", "movement", 2, 45);
      expect(sqlite.prepare("SELECT * FROM activities").all()).toEqual([
        {
          id: "f1",
          name: "Run 5 km",
          category: "movement",
          times_per_week: 2,
          duration: 45,
        },
      ]);
      sqlite.close();
    });

    it.each([
      ["category sport", ["f1", "Run", "sport", 2, 45]],
      ["15 times a week", ["f1", "Run", "movement", 15, 45]],
      ["a duration of 20", ["f1", "Run", "movement", 2, 20]],
    ])("refuses %s", (_label, row) => {
      openDatabase(path).close();
      const sqlite = new DatabaseSync(path);
      expect(() => sqlite.prepare(insert).run(...row)).toThrow(/CHECK/);
      expect(sqlite.prepare("SELECT * FROM activities").all()).toEqual([]);
      sqlite.close();
    });
  });

  it("rolls a failing step back and keeps the version and schema it had", () => {
    const sqlite = new DatabaseSync(path);
    const steps = [
      "CREATE TABLE first (id TEXT) STRICT;",
      "CREATE TABLE second (id TEXT) STRICT; INSERT INTO missing VALUES (1);",
    ];

    expect(() => migrate(sqlite, steps)).toThrow();

    expect(userVersion(sqlite)).toBe(1);
    expect(tableNames(sqlite)).toEqual(["first"]);
    sqlite.close();
  });

  it("runs only the steps after the file's version", () => {
    const sqlite = new DatabaseSync(path);
    migrate(sqlite, ["CREATE TABLE first (id TEXT) STRICT;"]);

    migrate(sqlite, [
      "CREATE TABLE first (id TEXT) STRICT;",
      "CREATE TABLE second (id TEXT) STRICT;",
    ]);

    expect(userVersion(sqlite)).toBe(2);
    expect(tableNames(sqlite)).toEqual(["first", "second"]);
    sqlite.close();
  });
});
