import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const webDir = fileURLToPath(new URL("../src/web", import.meta.url));
const uiDir = join(webDir, "ui");
const iconModule = join(uiDir, "Icon", "Icon.tsx");

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

/** Every `.ts`/`.tsx` file under `dir`, as absolute paths. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));
}

/** Files in `src/web` other than the Icon component that import lucide-react. */
function lucideImportersOtherThanIcon(): string[] {
  return sourceFiles(webDir)
    .filter((file) => file !== iconModule)
    .filter((file) =>
      /["']lucide-react(?:\/[^"']*)?["']/.test(readFileSync(file, "utf8")),
    )
    .sort();
}

describe("design system", () => {
  it("every component has stories", () => {
    expect(componentsWithoutStories(uiDir)).toEqual([]);
  });

  it("only Icon imports lucide-react", () => {
    expect(lucideImportersOtherThanIcon()).toEqual([]);
  });
});
