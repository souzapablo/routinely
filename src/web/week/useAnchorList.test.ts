import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnchorInput } from "../../shared/anchors.ts";
import type { Anchor } from "../../shared/planner.ts";
import {
  type DeleteResult,
  deleteAnchor,
  loadAnchors,
  type SaveResult,
  saveAnchor,
} from "../anchors/api.ts";
import { useAnchorList } from "./useAnchorList.ts";

vi.mock("../anchors/api.ts", () => ({
  loadAnchors: vi.fn(),
  saveAnchor: vi.fn(),
  deleteAnchor: vi.fn(),
}));

const read: Anchor = { id: "r", name: "read", days: [1], start: 420, end: 450 };
const work: Anchor = {
  id: "w",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

function inputOf(anchor: Anchor): AnchorInput {
  return {
    name: anchor.name,
    days: anchor.days,
    start: anchor.start,
    end: anchor.end,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

async function renderLoaded(anchors: Anchor[]) {
  vi.mocked(loadAnchors).mockResolvedValueOnce(anchors);
  const hook = renderHook(() => useAnchorList());
  await waitFor(() => expect(hook.result.current.load).toBe("ok"));
  return hook;
}

beforeEach(() => {
  vi.mocked(loadAnchors).mockReset();
  vi.mocked(saveAnchor).mockReset();
  vi.mocked(deleteAnchor).mockReset();
});

describe("useAnchorList loading", () => {
  it("is pending, then ok with the loaded anchors", async () => {
    const load = deferred<Anchor[] | "failed">();
    vi.mocked(loadAnchors).mockReturnValueOnce(load.promise);
    const { result } = renderHook(() => useAnchorList());

    expect(result.current.load).toBe("pending");
    expect(result.current.anchors).toEqual([]);

    await act(async () => {
      load.resolve([read, work]);
      await load.promise;
    });
    expect(result.current.load).toBe("ok");
    expect(result.current.anchors).toEqual([read, work]);
  });

  it("is failed with no anchors when the load fails", async () => {
    vi.mocked(loadAnchors).mockResolvedValueOnce("failed");
    const { result } = renderHook(() => useAnchorList());

    await waitFor(() => expect(result.current.load).toBe("failed"));
    expect(result.current.anchors).toEqual([]);
  });

  it("aborts the load in flight on unmount", () => {
    vi.mocked(loadAnchors).mockReturnValueOnce(new Promise(() => {}));
    const { unmount } = renderHook(() => useAnchorList());
    const signal = vi.mocked(loadAnchors).mock.calls[0][0];

    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("reloads as pending, then applies the new list", async () => {
    const { result } = await renderLoaded([work]);
    const load = deferred<Anchor[] | "failed">();
    vi.mocked(loadAnchors).mockReturnValueOnce(load.promise);

    act(() => result.current.reload());
    expect(result.current.load).toBe("pending");

    await act(async () => {
      load.resolve([read]);
      await load.promise;
    });
    expect(result.current.load).toBe("ok");
    expect(result.current.anchors).toEqual([read]);
  });
});

describe("useAnchorList save", () => {
  it("puts a saved anchor in the server's order", async () => {
    const storedRead: Anchor = { ...read, start: 600 };
    const { result } = await renderLoaded([storedRead]);
    const run: Anchor = {
      id: "n",
      name: "Run",
      days: [2],
      start: 600,
      end: 630,
    };
    vi.mocked(saveAnchor).mockResolvedValueOnce({ kind: "ok", anchor: run });

    await act(async () => {
      await result.current.save(null, inputOf(run));
    });
    expect(result.current.anchors.map((a) => a.name)).toEqual(["read", "Run"]);
  });

  it("replaces an edited anchor in place and re-sorts", async () => {
    const { result } = await renderLoaded([read, work]);
    const earlyWork: Anchor = { ...work, start: 360, end: 400 };
    vi.mocked(saveAnchor).mockResolvedValueOnce({
      kind: "ok",
      anchor: earlyWork,
    });

    await act(async () => {
      await result.current.save(work.id, inputOf(earlyWork));
    });
    expect(saveAnchor).toHaveBeenCalledWith(work.id, inputOf(earlyWork));
    expect(result.current.anchors).toEqual([earlyWork, read]);
  });

  it.each<SaveResult>([
    { kind: "ok", anchor: work },
    { kind: "rule", problem: { code: "nameEmpty" } },
    { kind: "notFound" },
    { kind: "failed" },
  ])("returns the $kind save result to the caller", async (answer) => {
    const { result } = await renderLoaded([read]);
    vi.mocked(saveAnchor).mockResolvedValueOnce(answer);

    let returned: SaveResult | undefined;
    await act(async () => {
      returned = await result.current.save(null, inputOf(work));
    });
    expect(returned).toEqual(answer);
  });

  it("keeps the list as it was when a save does not succeed", async () => {
    const { result } = await renderLoaded([read]);
    vi.mocked(saveAnchor).mockResolvedValueOnce({ kind: "failed" });

    await act(async () => {
      await result.current.save(null, inputOf(work));
    });
    expect(result.current.anchors).toEqual([read]);
  });
});

describe("useAnchorList remove", () => {
  it("removes a deleted anchor", async () => {
    const { result } = await renderLoaded([read, work]);
    vi.mocked(deleteAnchor).mockResolvedValueOnce({ kind: "ok" });

    await act(async () => {
      await result.current.remove(read.id);
    });
    expect(deleteAnchor).toHaveBeenCalledWith(read.id);
    expect(result.current.anchors).toEqual([work]);
  });

  it.each<DeleteResult>([
    { kind: "ok" },
    { kind: "notFound" },
    { kind: "failed" },
  ])("returns the $kind delete result to the caller", async (answer) => {
    const { result } = await renderLoaded([read]);
    vi.mocked(deleteAnchor).mockResolvedValueOnce(answer);

    let returned: DeleteResult | undefined;
    await act(async () => {
      returned = await result.current.remove(read.id);
    });
    expect(returned).toEqual(answer);
  });

  it("keeps the anchor when the delete fails", async () => {
    const { result } = await renderLoaded([read]);
    vi.mocked(deleteAnchor).mockResolvedValueOnce({ kind: "failed" });

    await act(async () => {
      await result.current.remove(read.id);
    });
    expect(result.current.anchors).toEqual([read]);
  });
});
