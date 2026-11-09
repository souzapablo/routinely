import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { migrate } from "./migrations.ts";

export interface Database {
  /** Runs `SELECT 1`; throws when the database can't answer. */
  ping(): void;
  close(): void;
}

export function openDatabase(path: string): Database {
  mkdirSync(dirname(path), { recursive: true });
  const sqlite = new DatabaseSync(path);
  try {
    migrate(sqlite);
  } catch (error) {
    sqlite.close();
    throw error;
  }

  return {
    ping() {
      sqlite.prepare("SELECT 1").get();
    },
    close() {
      sqlite.close();
    },
  };
}
