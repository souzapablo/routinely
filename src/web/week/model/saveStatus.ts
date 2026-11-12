import type { StatusTone } from "../../ui/StatusIndicator/StatusIndicator.tsx";

export type SaveStatus =
  "loading" | "loadFailed" | "saved" | "saving" | "notSaved";

export type LoadResult = "pending" | "ok" | "failed";

export interface StatusView {
  tone: StatusTone;
  key: `week.status.${SaveStatus}`;
}

const tones: Record<SaveStatus, StatusTone> = {
  loading: "busy",
  saving: "busy",
  saved: "ok",
  notSaved: "error",
  loadFailed: "error",
};

export function statusView(status: SaveStatus): StatusView {
  return { tone: tones[status], key: `week.status.${status}` };
}

export function afterLoads(
  anchors: LoadResult,
  activities: LoadResult,
): SaveStatus {
  if (anchors === "pending" || activities === "pending") return "loading";
  if (anchors === "failed" || activities === "failed") return "loadFailed";
  return "saved";
}
