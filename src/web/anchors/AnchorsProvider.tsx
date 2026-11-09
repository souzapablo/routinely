import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import type { AnchorProblem } from "../../shared/anchors.ts";
import type { Anchor } from "../../shared/planner.ts";
import { deleteAnchor, loadAnchors, saveAnchor } from "./api.ts";
import { type AnchorDraft, draftToInput } from "./model/form.ts";
import type { SaveStatus } from "./model/saveStatus.ts";

export type DrawerState =
  { mode: "closed" } | { mode: "add" } | { mode: "edit"; anchor: Anchor };

/** What the drawer shows after a save or delete; `closed` means nothing. */
export type DrawerOutcome =
  | { kind: "closed" }
  | { kind: "problem"; problem: AnchorProblem }
  | { kind: "failed" };

export interface AnchorsContextValue {
  anchors: Anchor[];
  status: SaveStatus;
  drawer: DrawerState;
  openAdd: () => void;
  openEdit: (id: string) => void;
  closeDrawer: () => void;
  save: (draft: AnchorDraft) => Promise<DrawerOutcome>;
  remove: () => Promise<DrawerOutcome>;
  toast: { id: number; text: string } | null;
  dismissToast: () => void;
}

const AnchorsContext = createContext<AnchorsContextValue | null>(null);

export function useAnchors(): AnchorsContextValue {
  const value = useContext(AnchorsContext);
  if (!value) throw new Error("useAnchors needs an AnchorsProvider");
  return value;
}

// The same order the server lists them in.
function byStartThenName(a: Anchor, b: Anchor): number {
  if (a.start !== b.start) return a.start - b.start;
  if (a.name === b.name) return 0;
  return a.name < b.name ? -1 : 1;
}

function withAnchor(anchors: Anchor[], anchor: Anchor): Anchor[] {
  return [...anchors.filter((a) => a.id !== anchor.id), anchor].sort(
    byStartThenName,
  );
}

const closed: DrawerOutcome = { kind: "closed" };
const failed: DrawerOutcome = { kind: "failed" };

export function AnchorsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastId = useRef(0);
  // Aborts the load in flight, so only the latest one is applied.
  const loadController = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    void loadAnchors(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result === "failed") {
        setAnchors([]);
        setStatus("loadFailed");
      } else {
        setAnchors(result);
        setStatus("saved");
      }
    });
  }, []);

  useEffect(() => {
    // React runs effects twice in development (StrictMode); the cleanup
    // aborts the first load so its late answer is dropped.
    load();
    return () => loadController.current?.abort();
  }, [load]);

  const showToast = useCallback((text: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, text });
  }, []);

  const alreadyDeleted = useCallback(() => {
    setDrawer({ mode: "closed" });
    setStatus("loading");
    load();
    showToast(t("anchors.toast.alreadyDeleted"));
  }, [load, showToast, t]);

  const save = useCallback(
    async (draft: AnchorDraft): Promise<DrawerOutcome> => {
      const id = drawer.mode === "edit" ? drawer.anchor.id : null;
      const before = status;
      setStatus("saving");
      const result = await saveAnchor(id, draftToInput(draft));
      switch (result.kind) {
        case "ok":
          setAnchors((current) => withAnchor(current, result.anchor));
          setDrawer({ mode: "closed" });
          setStatus("saved");
          showToast(t("anchors.toast.saved", { name: result.anchor.name }));
          return closed;
        case "rule":
          setStatus(before);
          return { kind: "problem", problem: result.problem };
        case "notFound":
          alreadyDeleted();
          return closed;
        case "failed":
          setStatus("notSaved");
          return failed;
      }
    },
    [drawer, status, showToast, alreadyDeleted, t],
  );

  const remove = useCallback(async (): Promise<DrawerOutcome> => {
    if (drawer.mode !== "edit") return closed;
    const { anchor } = drawer;
    setStatus("saving");
    const result = await deleteAnchor(anchor.id);
    switch (result.kind) {
      case "ok":
        setAnchors((current) => current.filter((a) => a.id !== anchor.id));
        setDrawer({ mode: "closed" });
        setStatus("saved");
        showToast(t("anchors.toast.deleted", { name: anchor.name }));
        return closed;
      case "notFound":
        alreadyDeleted();
        return closed;
      case "failed":
        setStatus("notSaved");
        return failed;
    }
  }, [drawer, showToast, alreadyDeleted, t]);

  const value = useMemo<AnchorsContextValue>(
    () => ({
      anchors,
      status,
      drawer,
      openAdd: () => setDrawer({ mode: "add" }),
      openEdit: (id) => {
        const anchor = anchors.find((a) => a.id === id);
        if (anchor) setDrawer({ mode: "edit", anchor });
      },
      closeDrawer: () => setDrawer({ mode: "closed" }),
      save,
      remove,
      toast,
      dismissToast: () => setToast(null),
    }),
    [anchors, status, drawer, save, remove, toast],
  );

  return (
    <AnchorsContext.Provider value={value}>{children}</AnchorsContext.Provider>
  );
}
