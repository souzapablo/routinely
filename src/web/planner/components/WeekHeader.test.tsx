import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../../i18n/index.ts";
import buttonStyles from "../../ui/Button/Button.module.css";
import { WeekHeader } from "./WeekHeader.tsx";

describe("WeekHeader", () => {
  it("shows This week and the range", () => {
    render(<WeekHeader rangeLabel="Nov 2 – Nov 8, 2026" />);

    expect(
      screen.getByRole("heading", { name: "This week" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nov 2 – Nov 8, 2026")).toBeInTheDocument();
  });

  it("draws the week controls disabled", () => {
    render(<WeekHeader rangeLabel="Nov 2 – Nov 8, 2026" />);

    const previous = screen.getByRole("button", { name: "Previous week" });
    const next = screen.getByRole("button", { name: "Next week" });
    const today = screen.getByRole("button", { name: "Today" });

    for (const button of [previous, next, today]) {
      expect(button).toBeDisabled();
    }
    // The arrows keep their look; only Today is faded, as in the prototype.
    expect(previous).not.toHaveClass(buttonStyles.disabled);
    expect(next).not.toHaveClass(buttonStyles.disabled);
    expect(today).toHaveClass(buttonStyles.disabled);
    expect(previous.querySelector("svg")).toHaveClass("lucide-chevron-left");
    expect(next.querySelector("svg")).toHaveClass("lucide-chevron-right");
  });
});
