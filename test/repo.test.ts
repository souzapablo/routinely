import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const root = fileURLToPath(new URL("..", import.meta.url));

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

// Task numbers, requirement and decision IDs, deviation markers and paths
// into the spec files. Two digits after the dash keep names like UTF-8 out.
const SPEC_REFERENCE =
  /\bT\d+\b|\b[A-Z]{2,}-\d{2,}\b|\bADR\b|SPEC_DEVIATION|\.specs\/|docs\/adr|\b(?:spec|design|tasks|context|validation)\.md\b/;

const COMMENT_SYNTAX: Record<string, RegExp[]> = {
  // The lookbehind skips `//` inside URLs and strings such as "http://".
  ts: [/\/\*[\s\S]*?\*\//g, /(?<![:\w"'`/])\/\/.*$/gm],
  css: [/\/\*[\s\S]*?\*\//g],
  html: [/<!--[\s\S]*?-->/g],
  yml: [/(?:^|\s)#.*$/gm],
};
const SYNTAX_BY_EXTENSION: Record<string, string> = {
  ts: "ts",
  tsx: "ts",
  js: "ts",
  mjs: "ts",
  cjs: "ts",
  css: "css",
  html: "html",
  yml: "yml",
  yaml: "yml",
};

/** Line numbers and text of comment lines that cite the spec. */
function specReferencesInComments(path: string, text: string): string[] {
  const syntax = SYNTAX_BY_EXTENSION[path.split(".").pop() ?? ""];
  if (syntax === undefined) {
    return [];
  }
  const found = new Set<string>();
  for (const pattern of COMMENT_SYNTAX[syntax] ?? []) {
    for (const match of text.matchAll(pattern)) {
      const firstLine = text.slice(0, match.index).split("\n").length;
      match[0].split("\n").forEach((line, offset) => {
        if (SPEC_REFERENCE.test(line)) {
          found.add(`${path}:${firstLine + offset}: ${line.trim()}`);
        }
      });
    }
  }
  return [...found].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
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

  it("code comments cite no tasks, requirements or decisions", () => {
    const files = spawnSync(
      "git",
      ["ls-files", "--cached", "--others", "--exclude-standard"],
      { cwd: root, encoding: "utf8" },
    )
      .stdout.split("\n")
      .filter(
        (path) =>
          path !== "" &&
          !/^(?:\.specs|docs|test\/fixtures)\//.test(path) &&
          existsSync(join(root, path)),
      );

    const found = files.flatMap((path) =>
      specReferencesInComments(path, read(path)),
    );

    expect(found).toEqual([]);
  });

  it("the comment check flags spec references in comments only", () => {
    const path = "test/fixtures/spec-comments.ts";

    const lines = specReferencesInComments(path, read(path)).map(
      (entry) => entry.split(":")[1],
    );

    // Lines 8-12 hold a plain comment, strings, a URL and UTF-8.
    expect(lines).toEqual(["1", "2", "4", "6", "7"]);
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
