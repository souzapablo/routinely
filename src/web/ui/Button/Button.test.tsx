import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button.tsx";
import styles from "./Button.module.css";

describe("Button", () => {
  it("is a native button of type button with only the base class by default", () => {
    render(<Button>Today</Button>);
    const button = screen.getByRole("button", { name: "Today" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(styles.button).toBeTruthy();
    expect(button.className).toBe(styles.button);
  });

  it.each(["primary", "ghost", "dashed", "accent"] as const)(
    "variant %s adds its own class",
    (variant) => {
      render(<Button variant={variant}>Label</Button>);
      expect(styles[variant]).toBeTruthy();
      expect(screen.getByRole("button").className).toBe(
        `${styles.button} ${styles[variant]}`,
      );
    },
  );

  it("size sm adds its class", () => {
    render(<Button size="sm">Find a time</Button>);
    expect(styles.sm).toBeTruthy();
    expect(screen.getByRole("button")).toHaveClass(styles.sm);
  });

  it("draws the icon before the label", () => {
    render(<Button icon="plus">Add activity</Button>);
    const button = screen.getByRole("button", { name: "Add activity" });
    const svg = button.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(button.firstElementChild).toBe(svg);
  });

  it("iconOnly shows just the icon and names the button with the label", () => {
    render(
      <Button icon="chevronLeft" iconOnly>
        Previous week
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Previous week" });
    expect(button).toHaveAttribute("aria-label", "Previous week");
    expect(button).toHaveTextContent(/^$/);
    expect(button.querySelector("svg")).not.toBeNull();
    expect(button).toHaveClass(styles.iconOnly);
  });

  it("collapseLabel keeps the label as the accessible name and marks it to hide on phones", () => {
    render(
      <Button variant="primary" icon="plus" collapseLabel>
        Add activity
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Add activity" });
    expect(button).not.toHaveAttribute("aria-label");
    const label = screen.getByText("Add activity");
    expect(styles.collapse).toBeTruthy();
    expect(label).toHaveClass(styles.collapse);
  });

  it.each([true, false])("pressed=%s sets aria-pressed", (pressed) => {
    render(<Button pressed={pressed}>English</Button>);
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      String(pressed),
    );
  });

  it("leaves aria-pressed off when pressed is not given", () => {
    render(<Button>Today</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
  });

  it("disabled is native and faded", () => {
    render(<Button disabled>Today</Button>);
    const button = screen.getByRole("button", { name: "Today" });
    expect(button).toBeDisabled();
    expect(styles.disabled).toBeTruthy();
    expect(button).toHaveClass(styles.disabled);
  });

  it("inert is natively disabled with no faded class", () => {
    render(<Button inert>Find a time</Button>);
    const button = screen.getByRole("button", { name: "Find a time" });
    expect(button).toBeDisabled();
    expect(button).not.toHaveClass(styles.disabled);
    expect(button.className).toBe(styles.button);
    expect(button).not.toHaveAttribute("inert");
  });

  it("disabled and inert buttons are skipped by Tab", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Button>Before</Button>
        <Button disabled>Faded</Button>
        <Button inert>Drawn only</Button>
        <Button>After</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Faded" })).toHaveAttribute(
      "disabled",
    );
    expect(screen.getByRole("button", { name: "Drawn only" })).toHaveAttribute(
      "disabled",
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Before" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });

  it("calls onClick when enabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Today</Button>);
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when inert", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button inert onClick={onClick}>
        Today
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
