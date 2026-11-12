import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActivityInput } from "../../shared/activities.ts";
import type { FlexibleActivity } from "../../shared/planner.ts";
import {
  type DeleteResult,
  deleteActivity,
  loadActivities,
  type SaveResult,
  saveActivity,
} from "../activities/api.ts";
import { useActivityList } from "./useActivityList.ts";

vi.mock("../activities/api.ts", () => ({
  loadActivities: vi.fn(),
  saveActivity: vi.fn(),
  deleteActivity: vi.fn(),
}));

const read: FlexibleActivity = {
  id: "r",
  name: "read",
  category: "rest",
  timesPerWeek: 3,
  duration: 30,
};
const walk: FlexibleActivity = {
  id: "w",
  name: "Walk",
  category: "movement",
  timesPerWeek: 5,
  duration: 45,
};

function inputOf(activity: FlexibleActivity): ActivityInput {
  return {
    name: activity.name,
    category: activity.category,
    timesPerWeek: activity.timesPerWeek,
    duration: activity.duration,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

async function renderLoaded(activities: FlexibleActivity[]) {
  vi.mocked(loadActivities).mockResolvedValueOnce(activities);
  const hook = renderHook(() => useActivityList());
  await waitFor(() => expect(hook.result.current.load).toBe("ok"));
  return hook;
}

beforeEach(() => {
  vi.mocked(loadActivities).mockReset();
  vi.mocked(saveActivity).mockReset();
  vi.mocked(deleteActivity).mockReset();
});

describe("useActivityList loading", () => {
  it("is pending, then ok with the loaded activities", async () => {
    const load = deferred<FlexibleActivity[] | "failed">();
    vi.mocked(loadActivities).mockReturnValueOnce(load.promise);
    const { result } = renderHook(() => useActivityList());

    expect(result.current.load).toBe("pending");
    expect(result.current.activities).toEqual([]);

    await act(async () => {
      load.resolve([read, walk]);
      await load.promise;
    });
    expect(result.current.load).toBe("ok");
    expect(result.current.activities).toEqual([read, walk]);
  });

  it("is failed with no activities when the load fails", async () => {
    vi.mocked(loadActivities).mockResolvedValueOnce("failed");
    const { result } = renderHook(() => useActivityList());

    await waitFor(() => expect(result.current.load).toBe("failed"));
    expect(result.current.activities).toEqual([]);
  });

  it("aborts the load in flight on unmount", () => {
    vi.mocked(loadActivities).mockReturnValueOnce(new Promise(() => {}));
    const { unmount } = renderHook(() => useActivityList());
    const signal = vi.mocked(loadActivities).mock.calls[0][0];

    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("reloads as pending, then applies the new list", async () => {
    const { result } = await renderLoaded([walk]);
    const load = deferred<FlexibleActivity[] | "failed">();
    vi.mocked(loadActivities).mockReturnValueOnce(load.promise);

    act(() => result.current.reload());
    expect(result.current.load).toBe("pending");

    await act(async () => {
      load.resolve([read]);
      await load.promise;
    });
    expect(result.current.load).toBe("ok");
    expect(result.current.activities).toEqual([read]);
  });
});

describe("useActivityList save", () => {
  it("puts a saved Run after a stored read", async () => {
    const { result } = await renderLoaded([read]);
    const run: FlexibleActivity = {
      id: "n",
      name: "Run",
      category: "movement",
      timesPerWeek: 2,
      duration: 45,
    };
    vi.mocked(saveActivity).mockResolvedValueOnce({
      kind: "ok",
      activity: run,
    });

    await act(async () => {
      await result.current.save(null, inputOf(run));
    });
    expect(result.current.activities.map((a) => a.name)).toEqual([
      "read",
      "Run",
    ]);
  });

  it("replaces an edited activity in place and re-sorts", async () => {
    const { result } = await renderLoaded([read, walk]);
    const renamed: FlexibleActivity = { ...walk, name: "Alongar" };
    vi.mocked(saveActivity).mockResolvedValueOnce({
      kind: "ok",
      activity: renamed,
    });

    await act(async () => {
      await result.current.save(walk.id, inputOf(renamed));
    });
    expect(saveActivity).toHaveBeenCalledWith(walk.id, inputOf(renamed));
    expect(result.current.activities).toEqual([renamed, read]);
  });

  it.each<SaveResult>([
    { kind: "ok", activity: walk },
    { kind: "rule", problem: { code: "timesOutOfRange" } },
    { kind: "notFound" },
    { kind: "failed" },
  ])("returns the $kind save result to the caller", async (answer) => {
    const { result } = await renderLoaded([read]);
    vi.mocked(saveActivity).mockResolvedValueOnce(answer);

    let returned: SaveResult | undefined;
    await act(async () => {
      returned = await result.current.save(null, inputOf(walk));
    });
    expect(returned).toEqual(answer);
  });

  it("keeps the list as it was when a save does not succeed", async () => {
    const { result } = await renderLoaded([read]);
    vi.mocked(saveActivity).mockResolvedValueOnce({ kind: "failed" });

    await act(async () => {
      await result.current.save(null, inputOf(walk));
    });
    expect(result.current.activities).toEqual([read]);
  });
});

describe("useActivityList remove", () => {
  it("removes a deleted activity", async () => {
    const { result } = await renderLoaded([read, walk]);
    vi.mocked(deleteActivity).mockResolvedValueOnce({ kind: "ok" });

    await act(async () => {
      await result.current.remove(read.id);
    });
    expect(deleteActivity).toHaveBeenCalledWith(read.id);
    expect(result.current.activities).toEqual([walk]);
  });

  it.each<DeleteResult>([
    { kind: "ok" },
    { kind: "notFound" },
    { kind: "failed" },
  ])("returns the $kind delete result to the caller", async (answer) => {
    const { result } = await renderLoaded([read]);
    vi.mocked(deleteActivity).mockResolvedValueOnce(answer);

    let returned: DeleteResult | undefined;
    await act(async () => {
      returned = await result.current.remove(read.id);
    });
    expect(returned).toEqual(answer);
  });

  it("keeps the activity when the delete fails", async () => {
    const { result } = await renderLoaded([read]);
    vi.mocked(deleteActivity).mockResolvedValueOnce({ kind: "failed" });

    await act(async () => {
      await result.current.remove(read.id);
    });
    expect(result.current.activities).toEqual([read]);
  });
});
