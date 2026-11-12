import { useCallback, useEffect, useRef, useState } from "react";
import type { AnchorInput } from "../../shared/anchors.ts";
import { compareAnchors } from "../../shared/order.ts";
import type { Anchor } from "../../shared/planner.ts";
import {
  type DeleteResult,
  deleteAnchor,
  loadAnchors,
  type SaveResult,
  saveAnchor,
} from "../anchors/api.ts";
import type { LoadResult } from "./model/saveStatus.ts";

export interface AnchorList {
  anchors: Anchor[];
  load: LoadResult;
  reload: () => void;
  save: (id: string | null, input: AnchorInput) => Promise<SaveResult>;
  remove: (id: string) => Promise<DeleteResult>;
}

function withAnchor(anchors: Anchor[], anchor: Anchor): Anchor[] {
  return [...anchors.filter((a) => a.id !== anchor.id), anchor].sort(
    compareAnchors,
  );
}

export function useAnchorList(): AnchorList {
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [load, setLoad] = useState<LoadResult>("pending");
  // Aborts the load in flight, so only the latest one is applied.
  const loadController = useRef<AbortController | null>(null);

  const fetchList = useCallback(() => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    void loadAnchors(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result === "failed") {
        setAnchors([]);
        setLoad("failed");
      } else {
        setAnchors(result);
        setLoad("ok");
      }
    });
  }, []);

  const reload = useCallback(() => {
    setLoad("pending");
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    // React runs effects twice in development (StrictMode); the cleanup
    // aborts the first load so its late answer is dropped.
    fetchList();
    return () => loadController.current?.abort();
  }, [fetchList]);

  const save = useCallback(
    async (id: string | null, input: AnchorInput): Promise<SaveResult> => {
      const result = await saveAnchor(id, input);
      if (result.kind === "ok") {
        setAnchors((current) => withAnchor(current, result.anchor));
      }
      return result;
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<DeleteResult> => {
    const result = await deleteAnchor(id);
    if (result.kind === "ok") {
      setAnchors((current) => current.filter((a) => a.id !== id));
    }
    return result;
  }, []);

  return { anchors, load, reload, save, remove };
}
