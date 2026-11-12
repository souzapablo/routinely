import { describe, expect, it } from "vitest";
import type { Anchor, FlexibleActivity } from "../../../shared/planner.ts";
import i18n from "../../i18n/index.ts";
import { type DrawerState, drawerTitleKey, showsTypeRow } from "./drawer.ts";

const anchor: Anchor = {
  id: "a1",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

const activity: FlexibleActivity = {
  id: "f1",
  name: "Run 5 km",
  category: "movement",
  timesPerWeek: 2,
  duration: 45,
};

const addAnchor: DrawerState = { mode: "add", type: "anchor" };
const addFlexible: DrawerState = { mode: "add", type: "flexible" };
const editAnchor: DrawerState = { mode: "editAnchor", anchor };
const editActivity: DrawerState = { mode: "editActivity", activity };

describe("drawerTitleKey", () => {
  it.each([addAnchor, addFlexible])(
    "titles adding either type Add activity ($type)",
    (state) => {
      const key = drawerTitleKey(state);
      expect(key).toBe("drawer.addTitle");
      expect(i18n.getFixedT("en")(key)).toBe("Add activity");
      expect(i18n.getFixedT("pt-BR")(key)).toBe("Adicionar atividade");
    },
  );

  it("titles editing an anchor Edit anchor", () => {
    const key = drawerTitleKey(editAnchor);
    expect(key).toBe("drawer.editAnchorTitle");
    expect(i18n.getFixedT("en")(key)).toBe("Edit anchor");
    expect(i18n.getFixedT("pt-BR")(key)).toBe("Editar âncora");
  });

  it("titles editing an activity Edit activity", () => {
    const key = drawerTitleKey(editActivity);
    expect(key).toBe("drawer.editActivityTitle");
    expect(i18n.getFixedT("en")(key)).toBe("Edit activity");
    expect(i18n.getFixedT("pt-BR")(key)).toBe("Editar atividade");
  });
});

describe("showsTypeRow", () => {
  it("is true only while adding", () => {
    expect(showsTypeRow(addAnchor)).toBe(true);
    expect(showsTypeRow(addFlexible)).toBe(true);
    expect(showsTypeRow(editAnchor)).toBe(false);
    expect(showsTypeRow(editActivity)).toBe(false);
    expect(showsTypeRow({ mode: "closed" })).toBe(false);
  });
});
