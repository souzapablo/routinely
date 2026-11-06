import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app.ts";
import { openDatabase } from "./db.ts";

const port = Number(process.env.PORT ?? 3000);
const databasePath = process.env.DATABASE_PATH ?? "data/routinely.db";
const webRoot = fileURLToPath(new URL("../../dist/web", import.meta.url));

const db = openDatabase(databasePath);
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
