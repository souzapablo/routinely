import type { Anchor, FlexibleActivity } from "../../../shared/planner.ts";

export type ItemType = "anchor" | "flexible";

export type DrawerState =
  | { mode: "closed" }
  | { mode: "add"; type: ItemType }
  | { mode: "editAnchor"; anchor: Anchor }
  | { mode: "editActivity"; activity: FlexibleActivity };

export type DrawerTitleKey =
  "drawer.addTitle" | "drawer.editAnchorTitle" | "drawer.editActivityTitle";

export function drawerTitleKey(state: DrawerState): DrawerTitleKey {
  switch (state.mode) {
    case "editAnchor":
      return "drawer.editAnchorTitle";
    case "editActivity":
      return "drawer.editActivityTitle";
    default:
      return "drawer.addTitle";
  }
}

export function showsTypeRow(state: DrawerState): boolean {
  return state.mode === "add";
}
