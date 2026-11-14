import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Stepper, type StepperProps } from "./Stepper.tsx";

function renderStepper(props: Partial<StepperProps> = {}) {
  const onChange = vi.fn();
  render(
    <Stepper
      label="Times per week"
      min={1}
      max={14}
      value={3}
      decrementLabel="Fewer times"
      incrementLabel="More times"
      onChange={onChange}
      {...props}
    />,
  );
  return { onChange };
}

describe("Stepper", () => {
  it("is a group named by its label holding both buttons and the value", () => {
    renderStepper();
    const group = screen.getByRole("group", { name: "Times per week" });
    expect(group).toContainElement(
      screen.getByRole("button", { name: "Fewer times" }),
    );
    expect(group).toContainElement(
      screen.getByRole("button", { name: "More times" }),
    );
    expect(group).toContainElement(screen.getByRole("status"));
  });

  it("shows the value in a polite live output", () => {
    renderStepper({ value: 3 });
    const output = screen.getByRole("status");
    expect(output.tagName).toBe("OUTPUT");
    expect(output).toHaveAttribute("aria-live", "polite");
    expect(output).toHaveTextContent(/^3$/);
  });

  it("+ calls onChange with one more and − with one less", async () => {
    const user = userEvent.setup();
    const { onChange } = renderStepper({ value: 3 });
    await user.click(screen.getByRole("button", { name: "More times" }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole("button", { name: "Fewer times" }));
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it("disables − at min and leaves + enabled", () => {
    renderStepper({ value: 1 });
    expect(screen.getByRole("button", { name: "Fewer times" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "More times" })).toBeEnabled();
  });

  it("disables + at max and leaves − enabled", () => {
    renderStepper({ value: 14 });
    expect(screen.getByRole("button", { name: "More times" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Fewer times" })).toBeEnabled();
  });

  it("enables both buttons one step inside the bounds", () => {
    renderStepper({ value: 2, max: 3 });
    expect(screen.getByRole("button", { name: "Fewer times" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "More times" })).toBeEnabled();
  });
});
