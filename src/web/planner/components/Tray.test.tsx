import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../i18n/index.ts";
import swatchStyles from "../../ui/Swatch/Swatch.module.css";
import styles from "./Tray.module.css";
import { Tray, type TrayRow } from "./Tray.tsx";

const run: TrayRow = {
  key: "run",
  name: "Run 5 km",
  category: "movement",
  timesPerWeek: 2,
  placed: 1,
  durationLabel: "45 min",
  pips: ["done", "open"],
  state: "open",
};

const read: TrayRow = {
  key: "read",
  name: "Read",
  category: "rest",
  timesPerWeek: 3,
  placed: 2,
  durationLabel: "30 min",
  pips: ["done", "placed", "open"],
  state: "open",
};

const grocery: TrayRow = {
  key: "grocery",
  name: "Grocery shopping",
  category: "errands",
  timesPerWeek: 1,
  placed: 0,
  durationLabel: "1 h",
  pips: ["open"],
  state: "open",
};

const call: TrayRow = {
  key: "call",
  name: "Call parents",
  category: "people",
  timesPerWeek: 1,
  placed: 1,
  durationLabel: "30 min",
  pips: ["done"],
  state: "allDone",
};

function itemOf(name: string): HTMLElement {
  const item = screen.getByText(name).closest<HTMLElement>(`.${styles.item}`);
  if (!item) throw new Error(`no tray item for ${name}`);
  return item;
}

function pipsOf(item: HTMLElement): string[] {
  const pips = item.querySelectorAll(`.${styles.pip}`);
  return Array.from(pips, (pip) =>
    pip.classList.contains(styles.done)
      ? "done"
      : pip.classList.contains(styles.placed)
        ? "placed"
        : "open",
  );
}

describe("Tray", () => {
  it("shows the header, N left and the hint", () => {
    render(<Tray rows={[run, read, grocery, call]} left={4} />);

    expect(
      screen.getByRole("heading", { name: "Fit in this week" }),
    ).toBeInTheDocument();
    expect(screen.getByText("4 left")).toBeInTheDocument();
    expect(
      screen.getByText(
        "No fixed day or time. Drag one onto a free slot, or let Routinely find one.",
      ),
    ).toBeInTheDocument();
  });

  it("shows meta, pips and Find a time", () => {
    render(<Tray rows={[run, read, grocery]} left={4} />);

    const runItem = itemOf("Run 5 km");
    expect(runItem).toHaveTextContent("2× this week · 45 min · 1 placed");
    expect(pipsOf(runItem)).toEqual(["done", "open"]);
    expect(runItem.querySelector("svg.lucide-grip-vertical")).not.toBeNull();
    expect(
      within(runItem).getByRole("button", { name: "Find a time" }),
    ).toBeDisabled();

    expect(itemOf("Read")).toHaveTextContent(
      "3× this week · 30 min · 2 placed",
    );
    expect(pipsOf(itemOf("Read"))).toEqual(["done", "placed", "open"]);

    const groceryItem = itemOf("Grocery shopping");
    expect(groceryItem).toHaveTextContent("1× this week · 1 h");
    expect(groceryItem).not.toHaveTextContent("placed");
    expect(pipsOf(groceryItem)).toEqual(["open"]);
  });

  it("shows a fully placed activity with its swatch", () => {
    render(
      <Tray
        rows={[
          call,
          { ...run, placed: 2, pips: ["done", "placed"], state: "allPlaced" },
        ]}
        left={0}
      />,
    );

    const callItem = itemOf("Call parents");
    expect(callItem).toHaveClass(styles.full);
    expect(callItem).toHaveTextContent("All done this week");
    expect(
      callItem.querySelector(`.${swatchStyles.square}.${swatchStyles.people}`),
    ).not.toBeNull();
    expect(callItem.querySelector("svg.lucide-grip-vertical")).toBeNull();
    expect(within(callItem).queryByRole("button")).toBeNull();

    const runItem = itemOf("Run 5 km");
    expect(runItem).toHaveTextContent("All placed this week");
    expect(within(runItem).queryByRole("button")).toBeNull();
  });

  it("ends with New flexible activity", () => {
    render(<Tray rows={[run, call]} left={1} />);

    const buttons = screen.getAllByRole("button");
    const last = buttons[buttons.length - 1];
    expect(last).toHaveAccessibleName("+ New flexible activity");
    expect(last).toBeDisabled();
  });

  it("shows the empty text and 0 left", () => {
    render(<Tray rows={[]} left={0} />);

    expect(
      screen.getByText(
        "Nothing here yet. Add something you'd like to fit into your week.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("0 left")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "+ New flexible activity" }),
    ).toBeDisabled();
  });
});
