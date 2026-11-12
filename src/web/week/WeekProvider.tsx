import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import type { AnchorProblem } from "../../shared/anchors.ts";
import type { Anchor } from "../../shared/planner.ts";
import { type AnchorDraft, draftToInput } from "../anchors/model/form.ts";
import type { DrawerState, ItemType } from "./model/drawer.ts";
import { afterLoads, type SaveStatus } from "./model/saveStatus.ts";
import { useAnchorList } from "./useAnchorList.ts";

/** What the drawer shows after a save or delete; `closed` means nothing. */
export type DrawerOutcome =
  | { kind: "closed" }
  | { kind: "problem"; problem: AnchorProblem }
  | { kind: "failed" };

export interface WeekContextValue {
  anchors: Anchor[];
  status: SaveStatus;
  drawer: DrawerState;
  openAdd: (type: ItemType) => void;
  openEditAnchor: (id: string) => void;
  closeDrawer: () => void;
  saveAnchor: (draft: AnchorDraft) => Promise<DrawerOutcome>;
  remove: () => Promise<DrawerOutcome>;
  toast: { id: number; text: string } | null;
  dismissToast: () => void;
}

const WeekContext = createContext<WeekContextValue | null>(null);

export function useWeek(): WeekContextValue {
  const value = useContext(WeekContext);
  if (!value) throw new Error("useWeek needs a WeekProvider");
  return value;
}

const closed: DrawerOutcome = { kind: "closed" };
const failed: DrawerOutcome = { kind: "failed" };

export function WeekProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const anchorList = useAnchorList();
  // A save or delete sets the status; null leaves it to the loads.
  const [actionStatus, setActionStatus] = useState<SaveStatus | null>(null);
  // Activities are not loaded yet, so they count as loaded.
  const status = actionStatus ?? afterLoads(anchorList.load, "ok");
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastId = useRef(0);

  const showToast = useCallback((text: string) => {
    toastId.current += 1;
    setToast({ id: toastId.current, text });
  }, []);

  const { reload: reloadAnchors } = anchorList;
  const anchorAlreadyDeleted = useCallback(() => {
    setDrawer({ mode: "closed" });
    setActionStatus(null);
    reloadAnchors();
    showToast(t("anchors.toast.alreadyDeleted"));
  }, [reloadAnchors, showToast, t]);

  const { save: storeAnchor } = anchorList;
  const saveAnchor = useCallback(
    async (draft: AnchorDraft): Promise<DrawerOutcome> => {
      const id = drawer.mode === "editAnchor" ? drawer.anchor.id : null;
      const before = actionStatus;
      setActionStatus("saving");
      const result = await storeAnchor(id, draftToInput(draft));
      switch (result.kind) {
        case "ok":
          setDrawer({ mode: "closed" });
          setActionStatus("saved");
          showToast(t("anchors.toast.saved", { name: result.anchor.name }));
          return closed;
        case "rule":
          setActionStatus(before);
          return { kind: "problem", problem: result.problem };
        case "notFound":
          anchorAlreadyDeleted();
          return closed;
        case "failed":
          setActionStatus("notSaved");
          return failed;
      }
    },
    [drawer, actionStatus, storeAnchor, showToast, anchorAlreadyDeleted, t],
  );

  const { remove: deleteAnchor } = anchorList;
  const remove = useCallback(async (): Promise<DrawerOutcome> => {
    if (drawer.mode !== "editAnchor") return closed;
    const { anchor } = drawer;
    setActionStatus("saving");
    const result = await deleteAnchor(anchor.id);
    switch (result.kind) {
      case "ok":
        setDrawer({ mode: "closed" });
        setActionStatus("saved");
        showToast(t("anchors.toast.deleted", { name: anchor.name }));
        return closed;
      case "notFound":
        anchorAlreadyDeleted();
        return closed;
      case "failed":
        setActionStatus("notSaved");
        return failed;
    }
  }, [drawer, deleteAnchor, showToast, anchorAlreadyDeleted, t]);

  const { anchors } = anchorList;
  const value = useMemo<WeekContextValue>(
    () => ({
      anchors,
      status,
      drawer,
      openAdd: (type) => setDrawer({ mode: "add", type }),
      openEditAnchor: (id) => {
        const anchor = anchors.find((a) => a.id === id);
        if (anchor) setDrawer({ mode: "editAnchor", anchor });
      },
      closeDrawer: () => setDrawer({ mode: "closed" }),
      saveAnchor,
      remove,
      toast,
      dismissToast: () => setToast(null),
    }),
    [anchors, status, drawer, saveAnchor, remove, toast],
  );

  return <WeekContext.Provider value={value}>{children}</WeekContext.Provider>;
}
