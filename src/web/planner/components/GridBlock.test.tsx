import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../i18n/index.ts";
import textStyles from "../../ui/Text/Text.module.css";
import styles from "./GridBlock.module.css";
import { GridBlock, type GridBlockModel } from "./GridBlock.tsx";

const work: GridBlockModel = {
  key: "anchor:work",
  kind: "anchor",
  name: "Work",
  timeLabel: "9:00 AM – 6:00 PM",
  category: "anchor",
  done: false,
  top: 132,
  height: 396,
  tiny: false,
};

const run: GridBlockModel = {
  key: "placement:run-mon",
  kind: "placement",
  name: "Run 5 km",
  timeLabel: "7:00 – 7:45 PM",
  category: "movement",
  done: false,
  top: 572,
  height: 33,
  tiny: false,
};

function blockOf(name: string): HTMLElement {
  const block = screen.getByText(name).closest<HTMLElement>(`.${styles.block}`);
  if (!block) throw new Error(`no block for ${name}`);
  return block;
}

function slotOf(name: string): HTMLElement {
  const slot = screen.getByText(name).closest<HTMLElement>(`.${styles.slot}`);
  if (!slot) throw new Error(`no slot for ${name}`);
  return slot;
}

describe("GridBlock", () => {
  it("draws an anchor as a locked slate block", () => {
    render(<GridBlock block={work} />);

    const block = blockOf("Work");
    expect(block).toHaveClass(styles.anchor);
    expect(block).not.toHaveClass(styles.placement);
    expect(block.querySelector("svg.lucide-lock")).not.toBeNull();
    expect(block).toHaveTextContent("9:00 AM – 6:00 PM");
    expect(slotOf("Work")).toHaveStyle({ top: "132px", height: "396px" });

    const check = screen.getByRole("button", { name: "Mark Work done" });
    expect(check).toBeDisabled();
    expect(check).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.queryByRole("button", { name: "Move Work back to the list" }),
    ).toBeNull();
  });

  it("draws a placement in its category color", () => {
    render(<GridBlock block={run} />);

    const block = blockOf("Run 5 km");
    expect(block).toHaveClass(styles.placement);
    expect(block.style.getPropertyValue("--tone-bg")).toBe("var(--sage-bg)");
    expect(block.style.getPropertyValue("--tone-ink")).toBe("var(--sage-ink)");
    expect(block.style.getPropertyValue("--tone-line")).toBe(
      "var(--sage-line)",
    );
    expect(block.querySelector("svg.lucide-lock")).toBeNull();
    expect(block).toHaveTextContent("7:00 – 7:45 PM");
    expect(slotOf("Run 5 km")).toHaveStyle({ top: "572px", height: "33px" });

    expect(
      screen.getByRole("button", { name: "Mark Run 5 km done" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move Run 5 km back to the list" }),
    ).toBeDisabled();
  });

  it("hides the time range on a tiny block", () => {
    render(<GridBlock block={{ ...run, tiny: true }} />);

    const block = blockOf("Run 5 km");
    expect(block).toHaveClass(styles.tiny);
    expect(block).not.toHaveTextContent("7:00 – 7:45 PM");
  });

  it("draws a done anchor faded with its check filled", () => {
    render(<GridBlock block={{ ...work, done: true }} />);

    expect(blockOf("Work")).toHaveClass(styles.done);
    expect(screen.getByText("Work")).not.toHaveClass(textStyles.strike);
    expect(
      screen.getByRole("button", { name: "Mark Work done" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("strikes through a done placement", () => {
    render(<GridBlock block={{ ...run, done: true }} />);

    expect(blockOf("Run 5 km")).toHaveClass(styles.done);
    expect(screen.getByText("Run 5 km")).toHaveClass(textStyles.strike);
    expect(
      screen.getByRole("button", { name: "Mark Run 5 km done" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
