import type { DatabaseSync } from "node:sqlite";

/**
 * The schema, one step per version, in order. Step n takes a file from
 * `user_version` n to n + 1. Never edit a step that has shipped; add one.
 */
export const migrations: string[] = [
  `CREATE TABLE anchors (
    id    TEXT PRIMARY KEY,
    name  TEXT NOT NULL,
    days  TEXT NOT NULL,
    start INTEGER NOT NULL,
    "end" INTEGER NOT NULL
  ) STRICT;`,
];

function userVersion(sqlite: DatabaseSync): number {
  const row = sqlite.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };
  return row.user_version;
}

/** Applies every step past the file's version, each in its own transaction. */
export function migrate(sqlite: DatabaseSync, steps = migrations): void {
  for (let version = userVersion(sqlite); version < steps.length; version++) {
    sqlite.exec("BEGIN");
    try {
      sqlite.exec(steps[version]);
      // PRAGMA takes no bound parameters; version is a loop counter.
      sqlite.exec(`PRAGMA user_version = ${version + 1}`);
      sqlite.exec("COMMIT");
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  }
}
