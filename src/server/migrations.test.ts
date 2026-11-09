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

  it("brings a fresh file to the last version with an anchors table", () => {
    openDatabase(path).close();

    const sqlite = new DatabaseSync(path);
    expect(userVersion(sqlite)).toBe(migrations.length);
    expect(migrations.length).toBe(1);
    expect(tableNames(sqlite)).toEqual(["anchors"]);
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
    expect(userVersion(after)).toBe(1);
    expect(tableNames(after)).toEqual(["anchors"]);
    expect(after.prepare("SELECT id, name FROM anchors").all()).toEqual([
      { id: "a1", name: "Work" },
    ]);
    after.close();
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
