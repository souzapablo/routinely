import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { openDatabase } from "./db.ts";

describe("openDatabase", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "routinely-db-"));
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it("creates the database file and missing parent folders", () => {
    const path = join(tmp, "a", "b", "routinely.db");

    const db = openDatabase(path);
    db.close();

    expect(existsSync(join(tmp, "a"))).toBe(true);
    expect(existsSync(join(tmp, "a", "b"))).toBe(true);
    expect(existsSync(path)).toBe(true);
  });

  it("pings an open database", () => {
    const db = openDatabase(join(tmp, "routinely.db"));

    expect(() => db.ping()).not.toThrow();

    db.close();
  });

  it("throws on ping after the database is closed", () => {
    const db = openDatabase(join(tmp, "routinely.db"));
    db.close();

    expect(() => db.ping()).toThrow();
  });
});
