import { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityInput } from "../../shared/activities.ts";
import { compareActivities } from "../../shared/order.ts";
import type { FlexibleActivity } from "../../shared/planner.ts";
import {
  type DeleteResult,
  deleteActivity,
  loadActivities,
  type SaveResult,
  saveActivity,
} from "../activities/api.ts";
import type { LoadResult } from "./model/saveStatus.ts";

export interface ActivityList {
  activities: FlexibleActivity[];
  load: LoadResult;
  reload: () => void;
  save: (id: string | null, input: ActivityInput) => Promise<SaveResult>;
  remove: (id: string) => Promise<DeleteResult>;
}

function withActivity(
  activities: FlexibleActivity[],
  activity: FlexibleActivity,
): FlexibleActivity[] {
  return [...activities.filter((a) => a.id !== activity.id), activity].sort(
    compareActivities,
  );
}

export function useActivityList(): ActivityList {
  const [activities, setActivities] = useState<FlexibleActivity[]>([]);
  const [load, setLoad] = useState<LoadResult>("pending");
  // Aborts the load in flight, so only the latest one is applied.
  const loadController = useRef<AbortController | null>(null);

  const fetchList = useCallback(() => {
    loadController.current?.abort();
    const controller = new AbortController();
    loadController.current = controller;
    void loadActivities(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result === "failed") {
        setActivities([]);
        setLoad("failed");
      } else {
        setActivities(result);
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
    async (id: string | null, input: ActivityInput): Promise<SaveResult> => {
      const result = await saveActivity(id, input);
      if (result.kind === "ok") {
        setActivities((current) => withActivity(current, result.activity));
      }
      return result;
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<DeleteResult> => {
    const result = await deleteActivity(id);
    if (result.kind === "ok") {
      setActivities((current) => current.filter((a) => a.id !== id));
    }
    return result;
  }, []);

  return { activities, load, reload, save, remove };
}
