import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  globSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

// These tests run the real tools on the real repo, so they are slow.
const TIMEOUT = 120_000;

const root = fileURLToPath(new URL("..", import.meta.url));
const fixtures = join(root, "test", "fixtures");

// Files placed in the repo for one test. Each is removed after every test,
// pass or fail, so a broken run never leaves a type error or lint error behind.
const typeErrorFile = join(root, "test", "type-error.tmp.ts");
const hooksViolationFile = join(root, "src", "web", "hooks-violation.tmp.tsx");
const unformattedFile = join(root, "test", "unformatted.tmp.ts");
const rawOutsideUiFile = join(root, "src", "web", "raw-elements.tmp.tsx");
const rawInsideUiFile = join(root, "src", "web", "ui", "raw-elements.tmp.tsx");
const structuralFile = join(root, "src", "web", "structural-elements.tmp.tsx");

const rawElements = [
  "button",
  "input",
  "select",
  "textarea",
  "a",
  "label",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
];

type Run = { code: number | null; output: string };

function run(command: string): Run {
  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0" },
  });
  return { code: result.status, output: result.stdout + result.stderr };
}

function scripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts: Record<string, string>;
  };
  return pkg.scripts;
}

function normalize(path: string): string {
  return resolve(path).replaceAll("\\", "/").toLowerCase();
}

describe("harness", () => {
  afterEach(() => {
    for (const file of [
      typeErrorFile,
      hooksViolationFile,
      unformattedFile,
      rawOutsideUiFile,
      rawInsideUiFile,
      structuralFile,
    ]) {
      rmSync(file, { force: true });
    }
  });

  it(
    "typecheck passes on the clean repo",
    () => {
      const result = run("npm run typecheck");

      expect(result.code, result.output).toBe(0);
      for (const project of [
        "tsconfig.web.json",
        "tsconfig.node.json",
        "tsconfig.e2e.json",
      ]) {
        expect(result.output).toContain(`tsc -p ${project}`);
        const config = run(`npx tsc -p ${project} --showConfig`);
        const options = (
          JSON.parse(config.output) as {
            compilerOptions: { strict?: boolean };
          }
        ).compilerOptions;
        expect(options.strict, project).toBe(true);
      }
    },
    TIMEOUT,
  );

  it(
    "typecheck fails and names a file with a type error",
    () => {
      writeFileSync(typeErrorFile, 'export const count: number = "three";\n');

      const result = run("npm run typecheck");

      expect(result.code).not.toBe(0);
      expect(result.output).toContain("type-error.tmp.ts");
    },
    TIMEOUT,
  );

  it(
    "lint reports a React hooks rule violation",
    () => {
      copyFileSync(join(fixtures, "hooks-violation.tsx"), hooksViolationFile);

      const result = run("npm run lint");

      expect(result.code).not.toBe(0);
      expect(result.output).toContain("hooks-violation.tmp.tsx");
      expect(result.output).toContain("react-hooks/rules-of-hooks");
    },
    TIMEOUT,
  );

  it(
    "lint names every raw element outside src/web/ui",
    () => {
      copyFileSync(join(fixtures, "raw-elements.tsx"), rawOutsideUiFile);

      const result = run(`npx eslint ${rawOutsideUiFile}`);

      expect(result.code).not.toBe(0);
      for (const name of rawElements) {
        expect(result.output).toContain(
          `Use a component from src/web/ui instead of <${name}>`,
        );
      }
    },
    TIMEOUT,
  );

  it(
    "lint allows raw elements inside src/web/ui",
    () => {
      copyFileSync(join(fixtures, "raw-elements.tsx"), rawInsideUiFile);

      const result = run(`npx eslint ${rawInsideUiFile}`);

      expect(result.code, result.output).toBe(0);
    },
    TIMEOUT,
  );

  it(
    "lint allows structural elements outside src/web/ui",
    () => {
      copyFileSync(join(fixtures, "structural-elements.tsx"), structuralFile);

      const result = run(`npx eslint ${structuralFile}`);

      expect(result.code, result.output).toBe(0);
    },
    TIMEOUT,
  );

  it(
    "format check fails on an unformatted file",
    () => {
      copyFileSync(join(fixtures, "unformatted.ts"), unformattedFile);

      const result = run("npm run format:check");

      expect(result.code).not.toBe(0);
      expect(result.output).toContain("unformatted.tmp.ts");
    },
    TIMEOUT,
  );

  it(
    "npm test runs every test once in both projects",
    () => {
      // Running `npm test` here would run this file again, forever. Instead,
      // check the script is a single `vitest run`, and ask Vitest which tests
      // that run would collect.
      expect(scripts().test).toBe("vitest run");

      const result = run("npx vitest list --json");
      expect(result.code, result.output).toBe(0);
      const listed = JSON.parse(
        result.output.slice(result.output.indexOf("[")),
      ) as { name: string; file: string; projectName: string }[];

      const keys = listed.map((t) => `${normalize(t.file)} > ${t.name}`);
      expect(new Set(keys).size).toBe(keys.length);

      const projectOf = (file: string) =>
        normalize(file).includes("/src/web/") ? "web" : "server";
      for (const t of listed) {
        expect(t.projectName, t.file).toBe(projectOf(t.file));
      }

      const testFiles = globSync(
        ["src/**/*.test.{ts,tsx}", "test/**/*.test.ts"],
        { cwd: root },
      ).map((file) => normalize(join(root, file)));
      const listedFiles = new Set(listed.map((t) => normalize(t.file)));
      expect([...listedFiles].sort()).toEqual([...new Set(testFiles)].sort());
      expect(new Set(listed.map((t) => t.projectName))).toEqual(
        new Set(["web", "server"]),
      );
    },
    TIMEOUT,
  );

  it(
    "check runs every step in order and stops at the first failure",
    () => {
      expect(scripts().check).toBe(
        "npm run typecheck && npm run lint && npm run format:check && npm test && npm run build",
      );

      writeFileSync(typeErrorFile, 'export const count: number = "three";\n');

      const result = run("npm run check");

      expect(result.code).not.toBe(0);
      expect(result.output).toContain("> routinely@0.0.0 typecheck");
      expect(result.output).not.toContain("> routinely@0.0.0 lint");
    },
    TIMEOUT,
  );
});
