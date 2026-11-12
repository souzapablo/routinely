import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Anchor } from "../../shared/planner.ts";
import "../i18n/index.ts";
import { deleteAnchor, loadAnchors, saveAnchor } from "../anchors/api.ts";
import {
  WeekProvider,
  type WeekContextValue,
  useWeek,
} from "./WeekProvider.tsx";
import { newDraft } from "../anchors/model/form.ts";

vi.mock("../anchors/api.ts", () => ({
  loadAnchors: vi.fn(),
  saveAnchor: vi.fn(),
  deleteAnchor: vi.fn(),
}));

const work: Anchor = {
  id: "w",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};
const gym: Anchor = { id: "g", name: "Gym", days: [2], start: 1080, end: 1140 };

/** A promise the test resolves by hand, to see the state while it runs. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

let ctx: WeekContextValue;
const keep = (value: WeekContextValue) => {
  ctx = value;
};
function Probe() {
  keep(useWeek());
  return null;
}

async function renderLoaded(anchors: Anchor[] = [work]) {
  vi.mocked(loadAnchors).mockResolvedValueOnce(anchors);
  render(
    <WeekProvider>
      <Probe />
    </WeekProvider>,
  );
  await waitFor(() => expect(ctx.status).toBe("saved"));
}

beforeEach(() => {
  vi.mocked(loadAnchors).mockReset();
  vi.mocked(saveAnchor).mockReset();
  vi.mocked(deleteAnchor).mockReset();
});

describe("WeekProvider loading", () => {
  it("is loading, then saved with the stored anchors", async () => {
    const load = deferred<Anchor[] | "failed">();
    vi.mocked(loadAnchors).mockReturnValueOnce(load.promise);
    render(
      <WeekProvider>
        <Probe />
      </WeekProvider>,
    );

    expect(ctx.status).toBe("loading");
    expect(ctx.anchors).toEqual([]);

    await act(async () => {
      load.resolve([work, gym]);
      await load.promise;
    });
    expect(ctx.status).toBe("saved");
    expect(ctx.anchors).toEqual([work, gym]);
  });

  it("is loadFailed with no anchors when the load fails", async () => {
    vi.mocked(loadAnchors).mockResolvedValueOnce("failed");
    render(
      <WeekProvider>
        <Probe />
      </WeekProvider>,
    );

    await waitFor(() => expect(ctx.status).toBe("loadFailed"));
    expect(ctx.anchors).toEqual([]);
  });

  it("applies only the latest load under StrictMode's double effect", async () => {
    const first = deferred<Anchor[] | "failed">();
    const second = deferred<Anchor[] | "failed">();
    vi.mocked(loadAnchors)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const { StrictMode } = await import("react");
    render(
      <StrictMode>
        <WeekProvider>
          <Probe />
        </WeekProvider>
      </StrictMode>,
    );

    await act(async () => {
      second.resolve([gym]);
      await second.promise;
    });
    await act(async () => {
      first.resolve([work]);
      await first.promise;
    });
    expect(ctx.anchors).toEqual([gym]);
  });
});

describe("WeekProvider drawer", () => {
  it("opens to add, opens to edit a loaded anchor, and closes", async () => {
    await renderLoaded();
    expect(ctx.drawer).toEqual({ mode: "closed" });

    act(() => ctx.openAdd("anchor"));
    expect(ctx.drawer).toEqual({ mode: "add", type: "anchor" });

    act(() => ctx.openEditAnchor("w"));
    expect(ctx.drawer).toEqual({ mode: "editAnchor", anchor: work });

    act(() => ctx.closeDrawer());
    expect(ctx.drawer).toEqual({ mode: "closed" });
  });
});

describe("WeekProvider save", () => {
  it("is saving while the request runs, then closes, stores, is saved and toasts", async () => {
    await renderLoaded([gym]);
    act(() => ctx.openAdd("anchor"));
    const request = deferred<Awaited<ReturnType<typeof saveAnchor>>>();
    vi.mocked(saveAnchor).mockReturnValueOnce(request.promise);

    let outcome: Promise<unknown> = Promise.resolve();
    act(() => {
      outcome = ctx.saveAnchor({ ...newDraft(), name: "Work" });
    });
    expect(ctx.status).toBe("saving");
    expect(saveAnchor).toHaveBeenCalledWith(null, {
      name: "Work",
      days: [1, 2, 3, 4, 5],
      start: 540,
      end: 1080,
    });

    await act(async () => {
      request.resolve({ kind: "ok", anchor: work });
      await request.promise;
    });
    await expect(outcome).resolves.toEqual({ kind: "closed" });
    expect(ctx.drawer).toEqual({ mode: "closed" });
    expect(ctx.anchors).toEqual([work, gym]);
    expect(ctx.status).toBe("saved");
    expect(ctx.toast?.text).toBe("Saved Work.");
  });

  it("replaces the edited anchor in place", async () => {
    await renderLoaded([work]);
    act(() => ctx.openEditAnchor("w"));
    const edited = { ...work, end: 1020 };
    vi.mocked(saveAnchor).mockResolvedValueOnce({ kind: "ok", anchor: edited });

    await act(() =>
      ctx.saveAnchor({
        name: "Work",
        days: [1, 2, 3, 4, 5],
        start: "09:00",
        end: "17:00",
      }),
    );

    expect(saveAnchor).toHaveBeenCalledWith("w", expect.anything());
    expect(ctx.anchors).toEqual([edited]);
  });

  it("keeps the drawer open on a rule, returns the problem and restores the status", async () => {
    await renderLoaded();
    act(() => ctx.openAdd("anchor"));
    const problem = {
      code: "overlap" as const,
      other: "Work",
      day: 1 as const,
    };
    vi.mocked(saveAnchor).mockResolvedValueOnce({ kind: "rule", problem });

    let outcome: unknown;
    await act(async () => {
      outcome = await ctx.saveAnchor({ ...newDraft(), name: "Gym" });
    });

    expect(outcome).toEqual({ kind: "problem", problem });
    expect(ctx.drawer).toEqual({ mode: "add", type: "anchor" });
    expect(ctx.status).toBe("saved");
    expect(ctx.anchors).toEqual([work]);
    expect(ctx.toast).toBeNull();
  });

  it("returns the failure and is notSaved when the save fails", async () => {
    await renderLoaded();
    act(() => ctx.openAdd("anchor"));
    vi.mocked(saveAnchor).mockResolvedValueOnce({ kind: "failed" });

    let outcome: unknown;
    await act(async () => {
      outcome = await ctx.saveAnchor({ ...newDraft(), name: "Gym" });
    });

    expect(outcome).toEqual({ kind: "failed" });
    expect(ctx.drawer).toEqual({ mode: "add", type: "anchor" });
    expect(ctx.status).toBe("notSaved");
    expect(ctx.anchors).toEqual([work]);
  });

  it("closes, reloads and toasts when the anchor was deleted elsewhere", async () => {
    await renderLoaded([work, gym]);
    act(() => ctx.openEditAnchor("g"));
    vi.mocked(saveAnchor).mockResolvedValueOnce({ kind: "notFound" });
    vi.mocked(loadAnchors).mockResolvedValueOnce([work]);

    let outcome: unknown;
    await act(async () => {
      outcome = await ctx.saveAnchor({ ...newDraft(), name: "Gym" });
    });

    expect(outcome).toEqual({ kind: "closed" });
    expect(ctx.drawer).toEqual({ mode: "closed" });
    expect(ctx.toast?.text).toBe("That anchor was already deleted.");
    expect(loadAnchors).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(ctx.anchors).toEqual([work]));
    expect(ctx.status).toBe("saved");
  });
});

describe("WeekProvider remove", () => {
  it("drops the anchor, closes, is saved and toasts", async () => {
    await renderLoaded([work, gym]);
    act(() => ctx.openEditAnchor("w"));
    vi.mocked(deleteAnchor).mockResolvedValueOnce({ kind: "ok" });

    let outcome: unknown;
    await act(async () => {
      outcome = await ctx.remove();
    });

    expect(deleteAnchor).toHaveBeenCalledWith("w");
    expect(outcome).toEqual({ kind: "closed" });
    expect(ctx.anchors).toEqual([gym]);
    expect(ctx.drawer).toEqual({ mode: "closed" });
    expect(ctx.status).toBe("saved");
    expect(ctx.toast?.text).toBe("Deleted Work.");
  });

  it("keeps the anchor and is notSaved when the delete fails", async () => {
    await renderLoaded();
    act(() => ctx.openEditAnchor("w"));
    vi.mocked(deleteAnchor).mockResolvedValueOnce({ kind: "failed" });

    let outcome: unknown;
    await act(async () => {
      outcome = await ctx.remove();
    });

    expect(outcome).toEqual({ kind: "failed" });
    expect(ctx.anchors).toEqual([work]);
    expect(ctx.drawer).toEqual({ mode: "editAnchor", anchor: work });
    expect(ctx.status).toBe("notSaved");
  });

  it("closes, reloads and toasts when the anchor was already deleted", async () => {
    await renderLoaded([work]);
    act(() => ctx.openEditAnchor("w"));
    vi.mocked(deleteAnchor).mockResolvedValueOnce({ kind: "notFound" });
    vi.mocked(loadAnchors).mockResolvedValueOnce([]);

    await act(() => ctx.remove());

    expect(ctx.drawer).toEqual({ mode: "closed" });
    expect(ctx.toast?.text).toBe("That anchor was already deleted.");
    await waitFor(() => expect(ctx.anchors).toEqual([]));
  });
});

describe("WeekProvider toast", () => {
  it("gives the same text a new id each time and clears on dismiss", async () => {
    await renderLoaded([]);
    vi.mocked(saveAnchor).mockResolvedValue({ kind: "ok", anchor: work });
    act(() => ctx.openAdd("anchor"));
    await act(() => ctx.saveAnchor({ ...newDraft(), name: "Work" }));
    const firstId = ctx.toast?.id;
    act(() => ctx.openEditAnchor("w"));
    await act(() => ctx.saveAnchor({ ...newDraft(), name: "Work" }));

    expect(ctx.toast?.text).toBe("Saved Work.");
    expect(ctx.toast?.id).not.toBe(firstId);

    act(() => ctx.dismissToast());
    expect(ctx.toast).toBeNull();
  });
});
