import { type ChildProcess, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const entry = fileURLToPath(new URL("./index.ts", import.meta.url));

type Started = {
  child: ChildProcess;
  stdout: () => string;
  stderr: () => string;
  exited: Promise<number | null>;
};

function startServer(env: Record<string, string>): Started {
  const child = spawn(process.execPath, [entry], {
    env: { ...process.env, ...env },
  });
  let out = "";
  let err = "";
  child.stdout.on("data", (chunk: Buffer) => (out += chunk.toString()));
  child.stderr.on("data", (chunk: Buffer) => (err += chunk.toString()));
  const exited = new Promise<number | null>((resolve) =>
    child.on("exit", (code) => resolve(code)),
  );
  return { child, stdout: () => out, stderr: () => err, exited };
}

async function waitForOutput(server: Started, text: string): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (!server.stdout().includes(text)) {
    if (server.child.exitCode !== null || Date.now() > deadline) {
      throw new Error(
        `server did not print "${text}"\nstdout: ${server.stdout()}\nstderr: ${server.stderr()}`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

function listenOnFreePort(): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(0, "0.0.0.0", () => resolve(server));
  });
}

function portOf(server: Server): number {
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("expected a TCP address");
  }
  return address.port;
}

async function freePort(): Promise<number> {
  const server = await listenOnFreePort();
  const port = portOf(server);
  await new Promise((resolve) => server.close(resolve));
  return port;
}

describe("server entry", () => {
  let tmp: string;
  let started: Started | undefined;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "routinely-entry-"));
  });

  afterEach(async () => {
    if (started && started.child.exitCode === null) {
      started.child.kill();
      await started.exited;
    }
    started = undefined;
    rmSync(tmp, { recursive: true, force: true });
  });

  it("listens on 0.0.0.0 at PORT and answers the API", async () => {
    const port = await freePort();
    started = startServer({
      PORT: String(port),
      DATABASE_PATH: join(tmp, "routinely.db"),
    });
    await waitForOutput(started, "listening");

    const res = await fetch(`http://127.0.0.1:${port}/api/health`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", db: "ok" });
    expect(started.stdout()).toContain(`http://0.0.0.0:${port}`);
  }, 15_000);

  it("logs one line with the address and port", async () => {
    const port = await freePort();
    started = startServer({
      PORT: String(port),
      DATABASE_PATH: join(tmp, "routinely.db"),
    });
    await waitForOutput(started, "listening");
    await fetch(`http://127.0.0.1:${port}/api/health`);

    expect(started.stdout().trimEnd().split(/\r?\n/)).toEqual([
      `Routinely listening on http://0.0.0.0:${port}`,
    ]);
  }, 15_000);

  it("keeps anchors after a restart", async () => {
    const port = await freePort();
    const env = {
      PORT: String(port),
      DATABASE_PATH: join(tmp, "routinely.db"),
    };
    const anchorsUrl = `http://127.0.0.1:${port}/api/anchors`;
    started = startServer(env);
    await waitForOutput(started, "listening");
    const created = await fetch(anchorsUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Work",
        days: [1, 2, 3, 4, 5],
        start: 540,
        end: 1080,
      }),
    });
    expect(created.status).toBe(201);
    const stored: unknown = await created.json();
    started.child.kill();
    await started.exited;

    started = startServer(env);
    await waitForOutput(started, "listening");
    const res = await fetch(anchorsUrl);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([stored]);
  }, 20_000);

  it("keeps activities after a restart", async () => {
    const port = await freePort();
    const env = {
      PORT: String(port),
      DATABASE_PATH: join(tmp, "routinely.db"),
    };
    const activitiesUrl = `http://127.0.0.1:${port}/api/activities`;
    started = startServer(env);
    await waitForOutput(started, "listening");
    const created = await fetch(activitiesUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Run 5 km",
        category: "movement",
        timesPerWeek: 2,
        duration: 45,
      }),
    });
    expect(created.status).toBe(201);
    const stored: unknown = await created.json();
    started.child.kill();
    await started.exited;

    started = startServer(env);
    await waitForOutput(started, "listening");
    const res = await fetch(activitiesUrl);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([stored]);
    expect(stored).toMatchObject({
      name: "Run 5 km",
      category: "movement",
      timesPerWeek: 2,
      duration: 45,
    });
  }, 20_000);

  it("exits 1 and names the path when the database can't open", async () => {
    // A folder is not a file SQLite can open.
    started = startServer({
      PORT: String(await freePort()),
      DATABASE_PATH: tmp,
    });

    const code = await started.exited;

    expect(code).toBe(1);
    expect(started.stderr()).toContain(`Can't open the database at ${tmp}`);
    expect(started.stdout()).not.toContain("listening");
  }, 15_000);

  it("exits 1 and names the port when it is in use", async () => {
    const blocker = await listenOnFreePort();
    const port = portOf(blocker);
    try {
      started = startServer({
        PORT: String(port),
        DATABASE_PATH: join(tmp, "routinely.db"),
      });

      const code = await started.exited;

      expect(code).toBe(1);
      expect(started.stderr()).toContain(`Port ${port} is already in use`);
    } finally {
      await new Promise((resolve) => blocker.close(resolve));
    }
  }, 15_000);
});
