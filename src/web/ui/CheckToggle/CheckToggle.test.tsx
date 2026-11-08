import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckToggle } from "./CheckToggle.tsx";
import styles from "./CheckToggle.module.css";

describe("CheckToggle", () => {
  it("is a native button of type button with the toggle class", () => {
    render(<CheckToggle pressed={false} label="Mark Work done" />);
    const toggle = screen.getByRole("button");
    expect(toggle.tagName).toBe("BUTTON");
    expect(toggle).toHaveAttribute("type", "button");
    expect(styles.toggle).toBeTruthy();
    expect(toggle).toHaveClass(styles.toggle);
  });

  it.each([
    [true, "true"],
    [false, "false"],
  ])("pressed=%s sets aria-pressed to %s", (pressed, expected) => {
    render(<CheckToggle pressed={pressed} label="Mark Work done" />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-pressed",
      expected,
    );
  });

  it("is named by its label", () => {
    render(<CheckToggle pressed={false} label="Mark Gym class done" />);
    expect(screen.getByRole("button")).toHaveAccessibleName(
      "Mark Gym class done",
    );
  });

  it("draws the check icon, hidden from assistive tech", () => {
    render(<CheckToggle pressed label="Mark Work done" />);
    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveClass("lucide-check");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("inert is natively disabled and not given the HTML inert attribute", () => {
    render(<CheckToggle pressed label="Mark Work done" inert />);
    const toggle = screen.getByRole("button", { name: "Mark Work done" });
    expect(toggle).toBeDisabled();
    expect(toggle).not.toHaveAttribute("inert");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("inert toggles are skipped by Tab", async () => {
    const user = userEvent.setup();
    render(
      <>
        <CheckToggle pressed={false} label="Before" />
        <CheckToggle pressed label="Drawn only" inert />
        <CheckToggle pressed={false} label="After" />
      </>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("calls onClick when enabled and not when inert", async () => {
    const user = userEvent.setup();
    const onEnabled = vi.fn();
    const onInert = vi.fn();
    render(
      <>
        <CheckToggle pressed={false} label="Enabled" onClick={onEnabled} />
        <CheckToggle pressed={false} label="Inert" onClick={onInert} inert />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Enabled" }));
    await user.click(screen.getByRole("button", { name: "Inert" }));
    expect(onEnabled).toHaveBeenCalledTimes(1);
    expect(onInert).not.toHaveBeenCalled();
  });
});
