import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const uiDir = fileURLToPath(new URL("../src/web/ui", import.meta.url));

/** Component folders (`Name/Name.tsx`) whose stories file is missing or exports no story. */
function componentsWithoutStories(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(dir, name, `${name}.tsx`)))
    .filter((name) => {
      const stories = join(dir, name, `${name}.stories.tsx`);
      if (!existsSync(stories)) {
        return true;
      }
      const text = readFileSync(stories, "utf8");
      return (
        !/^export default\b/m.test(text) || !/^export const \w+/m.test(text)
      );
    })
    .sort();
}

describe("design system", () => {
  it("every component has stories", () => {
    expect(componentsWithoutStories(uiDir)).toEqual([]);
  });
});
