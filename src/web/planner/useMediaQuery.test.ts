import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useMediaQuery", () => {
  it("follows the query as it starts and stops matching", () => {
    let matches = true;
    let listener: (() => void) | undefined;
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) =>
        ({
          matches,
          media: query,
          addEventListener: (_: string, fn: () => void) => {
            listener = fn;
          },
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );

    const { result } = renderHook(() => useMediaQuery("(min-width: 981px)"));
    expect(result.current).toBe(true);

    matches = false;
    act(() => listener?.());
    expect(result.current).toBe(false);
  });
});
