import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const root = fileURLToPath(new URL("..", import.meta.url));

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

type Step = { uses?: string; run?: string; with?: Record<string, unknown> };
type Job = { if?: unknown; steps: Step[] };
type Workflow = { on: Record<string, unknown>; jobs: Record<string, Job> };

function workflow(): Workflow {
  return parse(read(".github/workflows/ci.yml")) as Workflow;
}

describe("repo", () => {
  it("gitignore excludes node_modules, build output, data and env files", () => {
    for (const path of [
      "node_modules/x",
      "dist/x",
      "data/routinely.db",
      ".env",
    ]) {
      const result = spawnSync("git", ["check-ignore", "--quiet", path], {
        cwd: root,
      });
      expect(result.status, `${path} should be ignored`).toBe(0);
    }
  });

  it("CLAUDE.md lists the commands and points to the docs", () => {
    const text = read("CLAUDE.md");

    for (const command of [
      "npm run dev",
      "npm run build",
      "npm start",
      "npm run check",
      "npm test",
      "npm run e2e",
    ]) {
      expect(text, command).toContain(`\`${command}\``);
    }
    expect(text).toContain("`docs/product.md`");
    expect(text).toContain("`docs/adr/`");
  });

  it("CI runs npm ci, check and e2e on push and pull_request", () => {
    const ci = workflow();

    expect(Object.keys(ci.on)).toEqual(
      expect.arrayContaining(["push", "pull_request"]),
    );

    const jobs = Object.values(ci.jobs);
    // A job-level `if` could skip the checks on one of the two triggers.
    for (const job of jobs) {
      expect(job.if).toBeUndefined();
    }

    const runs = jobs.flatMap((job) => job.steps.map((step) => step.run));
    const order = ["npm ci", "npm run check", "npm run e2e"].map((command) =>
      runs.indexOf(command),
    );
    expect(
      order.every((index) => index >= 0),
      runs.join(", "),
    ).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("Node major is pinned in .nvmrc, engines and CI", () => {
    const nvmrc = read(".nvmrc").trim();
    expect(nvmrc).toMatch(/^\d+$/);

    const pkg = JSON.parse(read("package.json")) as {
      engines: { node: string };
    };
    expect(pkg.engines.node).toBe(`>=${nvmrc} <${Number(nvmrc) + 1}`);

    const setupNode = Object.values(workflow().jobs)
      .flatMap((job) => job.steps)
      .filter((step) => step.uses?.startsWith("actions/setup-node@"));
    expect(setupNode).toHaveLength(1);
    expect(setupNode[0]?.with?.["node-version-file"]).toBe(".nvmrc");
    expect(setupNode[0]?.with?.["node-version"]).toBeUndefined();
  });
});
