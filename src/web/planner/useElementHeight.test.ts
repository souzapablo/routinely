import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useElementHeight } from "./useElementHeight.ts";

let resize: (() => void) | undefined;

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  resize = undefined;
});

function elementOfHeight(height: { value: number }) {
  const element = document.createElement("div");
  Object.defineProperty(element, "clientHeight", { get: () => height.value });
  return { current: element };
}

describe("useElementHeight", () => {
  it("measures the element and follows its resizes", () => {
    const height = { value: 510 };
    const ref = elementOfHeight(height);
    const { result } = renderHook(() => useElementHeight(ref, true));
    expect(result.current).toBe(510);

    height.value = 340;
    act(() => resize?.());
    expect(result.current).toBe(340);
  });

  it("is null while disabled", () => {
    const ref = elementOfHeight({ value: 510 });
    const { result } = renderHook(() => useElementHeight(ref, false));
    expect(result.current).toBeNull();
  });
});
