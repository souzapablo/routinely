import { describe, expect, it } from "vitest";
import css from "./spacing.css?raw";
import global from "./global.css?raw";

describe("spacing.css", () => {
  it("holds the gap scale 0 4 6 8 10 12 16 20 px", () => {
    const tokens = Object.fromEntries(
      [...css.matchAll(/(--space-\d)\s*:\s*([^;]+);/g)].map((m) => [
        m[1],
        m[2].trim(),
      ]),
    );

    expect(tokens).toEqual({
      "--space-0": "0",
      "--space-1": "4px",
      "--space-2": "6px",
      "--space-3": "8px",
      "--space-4": "10px",
      "--space-5": "12px",
      "--space-6": "16px",
      "--space-7": "20px",
    });
  });

  it("is loaded by the global stylesheet", () => {
    expect(global).toMatch(/@import\s+"\.\/spacing\.css";/);
  });
});
