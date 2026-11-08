import { describe, expect, it } from "vitest";
import { portFrom } from "./port.ts";

describe("portFrom", () => {
  it("uses 3000 when PORT is not set", () => {
    expect(portFrom(undefined)).toBe(3000);
  });

  it.each(["", "  "])("uses 3000 when PORT is empty (%j)", (value) => {
    expect(portFrom(value)).toBe(3000);
  });

  it("uses the number PORT names", () => {
    expect(portFrom("4100")).toBe(4100);
  });
});
