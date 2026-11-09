import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Anchor } from "../../shared/planner.ts";
import {
  type AnchorsContextValue,
  useAnchors,
} from "../anchors/AnchorsProvider.tsx";
import en from "../i18n/en.json";
import i18n from "../i18n/index.ts";
import ptBR from "../i18n/pt-BR.json";
import todayStyles from "./components/TodayStrip.module.css";
import gridBlockStyles from "./components/GridBlock.module.css";
import gridStyles from "./components/WeekGrid.module.css";
import { PlannerPage } from "./PlannerPage.tsx";

vi.mock("../anchors/AnchorsProvider.tsx", () => ({ useAnchors: vi.fn() }));

const SUNDAY_MORNING = new Date(2026, 10, 8, 7, 48);
// Thursday has a gym class at 07:00 and work, so today's list has two rows.
const THURSDAY_GYM = new Date(2026, 10, 5, 7, 30);

const work: Anchor = {
  id: "work",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};
const gym: Anchor = {
  id: "gym",
  name: "Gym class",
  days: [2, 4],
  start: 420,
  end: 480,
};

const openEdit = vi.fn();

function stubAnchors(anchors: Anchor[]) {
  vi.mocked(useAnchors).mockReturnValue({
    anchors,
    openEdit,
  } as unknown as AnchorsContextValue);
}

beforeEach(() => {
  openEdit.mockReset();
  stubAnchors([work, gym]);
});

function renderAt(now: Date) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  return render(<PlannerPage />);
}

afterEach(async () => {
  vi.useRealTimers();
  localStorage.clear();
  await i18n.changeLanguage("en");
});

function rowOf(name: string): HTMLElement {
  const label = screen.getByRole("checkbox", { name }).closest("label");
  if (!label) throw new Error(`no Today row for ${name}`);
  return label;
}

/** Every string in a translation file, with its key. */
function leaves(value: unknown, prefix = ""): [string, string][] {
  if (typeof value === "string") return [[prefix, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => leaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("PlannerPage", () => {
  it("shows This week and Nov 8 – Nov 14, 2026 on Sunday", () => {
    renderAt(SUNDAY_MORNING);

    expect(
      screen.getByRole("heading", { level: 1, name: "This week" }),
    ).toBeInTheDocument();
    expect(
      // Testing Library reads Intl's thin spaces as plain spaces.
      screen.getByText("Nov 8 – Nov 14, 2026"),
    ).toBeInTheDocument();
  });

  it("draws seven days from Sunday and hours 6 AM to 10 PM", () => {
    const { container } = renderAt(SUNDAY_MORNING);

    const heads = Array.from(container.querySelectorAll(`.${gridStyles.day}`));
    expect(
      heads.map((h) => h.querySelector(`.${gridStyles.weekday}`)?.textContent),
    ).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(
      heads.map(
        (h) => h.querySelector(`.${gridStyles.dayNumber}`)?.textContent,
      ),
    ).toEqual(["8", "9", "10", "11", "12", "13", "14"]);
    expect(heads[0]).toHaveClass(gridStyles.today);

    const hours = Array.from(
      container.querySelectorAll(`.${gridStyles.hourLabel}`),
      (h) => h.textContent,
    );
    expect(hours).toHaveLength(17);
    expect(hours[0]).toBe("6 AM");
    expect(hours[16]).toBe("10 PM");
  });

  it("lists Days you showed up Sunday first", () => {
    const { container } = renderAt(THURSDAY_GYM);

    const dots = Array.from(
      container.querySelectorAll(`.${todayStyles.dots} > div`),
    );
    expect(dots.map((d) => d.textContent)).toEqual([
      "S",
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
    ]);
    // Nothing stores done marks yet, so no day is shown as showed up.
    expect(dots.map((d) => d.classList.contains(todayStyles.on))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(dots[4]).toHaveClass(todayStyles.today);
  });

  it("lists today's items in time order", () => {
    renderAt(THURSDAY_GYM);

    expect(
      screen.getByRole("heading", { name: "Today · Thursday, Nov 5" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("checkbox")
        .map((box) => box.getAttribute("aria-label")),
    ).toEqual(["Gym class", "Work"]);
    expect(rowOf("Gym class")).toHaveTextContent("7:00 – 8:00 AM");
    expect(rowOf("Work")).toHaveTextContent("9:00 AM – 6:00 PM");
    expect(screen.getByText("0 of 2 done")).toBeInTheDocument();
  });

  it("shows Now on the current item", () => {
    renderAt(THURSDAY_GYM);

    expect(within(rowOf("Gym class")).getByText("Now")).toBeInTheDocument();
    expect(within(rowOf("Work")).queryByText("Now")).toBeNull();
  });

  it("draws every planner control disabled except the anchors' edit buttons", () => {
    renderAt(THURSDAY_GYM);

    const edits = screen.getAllByRole("button", { name: /^Edit / });
    for (const edit of edits) expect(edit).toBeEnabled();

    const buttons = screen
      .getAllByRole("button")
      .filter((button) => !edits.includes(button));
    const checkboxes = screen.getAllByRole("checkbox");
    for (const control of [...buttons, ...checkboxes]) {
      expect(control).toBeDisabled();
    }

    for (const name of [
      "Previous week",
      "Next week",
      "Today",
      "+ New flexible activity",
      "Mark Work done",
      "Mark Gym class done",
    ]) {
      expect(screen.getAllByRole("button", { name }).length).toBeGreaterThan(0);
    }
    expect(checkboxes).toHaveLength(2);
  });

  it("draws Work on Monday to Friday and nothing else on those days", () => {
    stubAnchors([work]);
    const { container } = renderAt(SUNDAY_MORNING);

    const columns = Array.from(
      container.querySelectorAll(`.${gridStyles.column}`),
    );
    expect(
      columns.map((column) =>
        Array.from(
          column.querySelectorAll(
            `.${gridBlockStyles.anchor} .${gridBlockStyles.name}`,
          ),
          (name) => name.textContent,
        ),
      ),
    ).toEqual([[], ["Work"], ["Work"], ["Work"], ["Work"], ["Work"], []]);
    expect(
      container.querySelectorAll(`.${gridBlockStyles.placement}`),
    ).toHaveLength(0);
    expect(screen.getAllByRole("button", { name: "Edit Work" })).toHaveLength(
      5,
    );
  });

  it("shows no flexible activities, only the tray's empty text", () => {
    renderAt(THURSDAY_GYM);

    expect(
      screen.getByText(
        "Nothing here yet. Add something you'd like to fit into your week.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Find a time" })).toBeNull();
  });

  it("shows the empty texts without error styling when no anchors are stored", () => {
    stubAnchors([]);
    const { container } = renderAt(THURSDAY_GYM);

    expect(
      screen.getByText(
        "Nothing planned today. Drag something from your list onto today, or take the day off.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Nothing here yet. Add something you'd like to fit into your week.",
      ),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(`.${gridBlockStyles.slot}`)).toHaveLength(
      0,
    );
    expect(container.querySelector('[class*="error"]')).toBeNull();
  });

  it("opens the clicked anchor block for editing", () => {
    renderAt(THURSDAY_GYM);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Edit Gym class" })[0],
    );
    expect(openEdit).toHaveBeenCalledWith("gym");
  });

  it("renders no English text in pt-BR", async () => {
    await i18n.changeLanguage("pt-BR");
    const { container } = renderAt(THURSDAY_GYM);

    const shown = [
      container.textContent ?? "",
      ...Array.from(
        container.querySelectorAll("[aria-label]"),
        (el) => el.getAttribute("aria-label") ?? "",
      ),
    ].join("\n");

    const portuguese = new Map(leaves(ptBR));
    const englishFragments = leaves(en)
      .filter(([key, text]) => portuguese.get(key) !== text)
      .flatMap(([, text]) => text.split(/\{\{\w+\}\}/))
      .map((fragment) => fragment.trim())
      // Short joins such as "of" could match inside an activity name.
      .filter((fragment) => fragment.length >= 3);
    const englishDates = ["Thursday", "Nov", "Mon", "Thu", "AM", "PM"];

    // Whole words only: "Move" is part of the Portuguese "Mover".
    for (const fragment of [...englishFragments, ...englishDates]) {
      const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(shown).not.toMatch(
        new RegExp(`(^|\\P{L})${escaped}($|\\P{L})`, "u"),
      );
    }
    expect(shown).toContain("Esta semana");
    expect(shown).toContain("Agora");
    expect(shown).toContain("07:00");
  });
});
