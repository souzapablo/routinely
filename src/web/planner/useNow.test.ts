import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./useNow.ts";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 8, 7, 48, 0));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("useNow", () => {
  it("returns the current time and updates it after 60 s, not before", () => {
    const { result } = renderHook(() => useNow());
    expect(result.current.getTime()).toBe(
      new Date(2026, 10, 8, 7, 48, 0).getTime(),
    );

    act(() => {
      vi.advanceTimersByTime(59_999);
    });
    expect(result.current.getTime()).toBe(
      new Date(2026, 10, 8, 7, 48, 0).getTime(),
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.getTime()).toBe(
      new Date(2026, 10, 8, 7, 49, 0).getTime(),
    );
  });

  it("leaves no timer after unmount", () => {
    const { unmount } = renderHook(() => useNow());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
