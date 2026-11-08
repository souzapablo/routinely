import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.ts";
import { type Database, openDatabase } from "./db.ts";
import { portFrom } from "./port.ts";

const port = portFrom(process.env.PORT);
const databasePath = process.env.DATABASE_PATH ?? "data/routinely.db";
const webRoot = fileURLToPath(new URL("../../dist/web", import.meta.url));

let db: Database;
try {
  db = openDatabase(databasePath);
} catch (error) {
  // A plain message instead of a stack trace: the owner fixes DATABASE_PATH.
  const reason = error instanceof Error ? `: ${error.message}` : "";
  console.error(`Can't open the database at ${databasePath}${reason}`);
  process.exit(1);
}
const app = buildApp({ db, webRoot });

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (error) {
  if (isAddressInUse(error)) {
    console.error(`Port ${port} is already in use`);
    db.close();
    process.exit(1);
  }
  throw error;
}

// Log the address the socket really bound to, not the one we asked for.
const address = app.server.address() as AddressInfo;
console.log(`Routinely listening on http://${address.address}:${address.port}`);

function isAddressInUse(error: unknown): boolean {
  return (
    error instanceof Error && "code" in error && error.code === "EADDRINUSE"
  );
}
