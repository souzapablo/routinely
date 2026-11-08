import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meter, meterPercent } from "./Meter.tsx";
import styles from "./Meter.module.css";

function fillOf(meter: HTMLElement): HTMLElement {
  const fill = meter.firstElementChild;
  if (!(fill instanceof HTMLElement)) throw new Error("meter has no fill");
  return fill;
}

describe("Meter", () => {
  it.each([
    [0, 13, "0%"],
    [1, 4, "25%"],
    [3, 8, "37.5%"],
    [13, 13, "100%"],
  ])("value %d of %d fills %s", (value, max, width) => {
    render(<Meter value={value} max={max} label="This week" />);
    const meter = screen.getByRole("meter");
    expect(meter).toHaveClass(styles.meter);
    expect(fillOf(meter)).toHaveClass(styles.fill);
    expect(fillOf(meter).style.width).toBe(width);
  });

  it("fills 0% when max is 0", () => {
    render(<Meter value={0} max={0} label="This week" />);
    expect(fillOf(screen.getByRole("meter")).style.width).toBe("0%");
  });

  it("exposes its values and name to assistive tech", () => {
    render(<Meter value={4} max={13} label="This week" />);
    const meter = screen.getByRole("meter", { name: "This week" });
    expect(meter).toHaveAttribute("aria-valuenow", "4");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "13");
  });
});

describe("meterPercent", () => {
  it.each([
    [0, 0, 0],
    [3, 0, 0],
    [1, 2, 50],
    [5, 4, 100],
    [-1, 4, 0],
  ])("meterPercent(%d, %d) is %d", (value, max, expected) => {
    expect(meterPercent(value, max)).toBe(expected);
  });
});
