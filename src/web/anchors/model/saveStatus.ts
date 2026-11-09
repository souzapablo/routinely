import type { StatusTone } from "../../ui/StatusIndicator/StatusIndicator.tsx";

export type SaveStatus =
  "loading" | "loadFailed" | "saved" | "saving" | "notSaved";

export interface StatusView {
  tone: StatusTone;
  key: `anchors.status.${SaveStatus}`;
}

const tones: Record<SaveStatus, StatusTone> = {
  loading: "busy",
  saving: "busy",
  saved: "ok",
  notSaved: "error",
  loadFailed: "error",
};

export function statusView(status: SaveStatus): StatusView {
  return { tone: tones[status], key: `anchors.status.${status}` };
}
