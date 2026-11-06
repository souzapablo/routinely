import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useHealth } from "./useHealth.ts";

const now = new Date(2026, 10, 6, 14, 5);

// Behaves like a fetch to a server that never answers: it only settles
// when its signal aborts, rejecting with the abort reason.
function neverAnswers(_url: string, init?: RequestInit): Promise<Response> {
  return new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => {
      reject(init.signal?.reason as Error);
    });
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useHealth", () => {
  it("starts in the checking state", () => {
    vi.stubGlobal("fetch", vi.fn(neverAnswers));

    const { result } = renderHook(() => useHealth());

    expect(result.current).toEqual({ state: "checking" });
  });

  it("shows server and database connected when the check answers 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ status: "ok", db: "ok" }))),
    );

    const { result } = renderHook(() => useHealth());
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(result.current).toEqual({
      state: "done",
      view: { server: "connected", db: "connected" },
      checkedAt: now,
    });
  });

  it("fails after 5 seconds without an answer", async () => {
    vi.stubGlobal("fetch", vi.fn(neverAnswers));

    const { result } = renderHook(() => useHealth());

    await act(() => vi.advanceTimersByTimeAsync(4999));
    expect(result.current).toEqual({ state: "checking" });

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(result.current).toEqual({
      state: "done",
      view: { server: "unreachable", db: "unreachable" },
      checkedAt: new Date(now.getTime() + 5000),
    });
  });

  it("aborts the request when unmounted", () => {
    const fetchMock = vi.fn(neverAnswers);
    vi.stubGlobal("fetch", fetchMock);

    const { unmount } = renderHook(() => useHealth());
    const signal = fetchMock.mock.calls[0]?.[1]?.signal;
    expect(signal?.aborted).toBe(false);

    unmount();

    expect(signal?.aborted).toBe(true);
  });
});
