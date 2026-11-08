import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CheckboxRow } from "./CheckboxRow.tsx";
import styles from "./CheckboxRow.module.css";
import textStyles from "../Text/Text.module.css";

describe("CheckboxRow", () => {
  it("names the checkbox with the title only, not the meta line or trailing slot", () => {
    render(
      <CheckboxRow
        title="Gym class"
        meta="7:00 – 8:00 AM"
        checked={false}
        trailing={<span>Now</span>}
      />,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAccessibleName("Gym class");
    expect(screen.getByText("7:00 – 8:00 AM")).toBeInTheDocument();
  });

  it("is a label wrapping a native checkbox", () => {
    render(
      <CheckboxRow title="Work" meta="9:00 AM – 6:00 PM" checked={false} />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Work" });
    expect(checkbox.tagName).toBe("INPUT");
    expect(checkbox).toHaveAttribute("type", "checkbox");
    expect(checkbox.closest("label")).not.toBeNull();
  });

  it.each([true, false])(
    "checked=%s is reflected by the checkbox",
    (checked) => {
      render(
        <CheckboxRow title="Read" meta="9:30 – 10:00 PM" checked={checked} />,
      );
      const checkbox = screen.getByRole("checkbox", { name: "Read" });
      if (checked) expect(checkbox).toBeChecked();
      else expect(checkbox).not.toBeChecked();
    },
  );

  it("checked gives the row the done class and strikes and mutes the title", () => {
    render(<CheckboxRow title="Read" meta="9:30 – 10:00 PM" checked />);
    const row = screen.getByRole("checkbox").closest("label");
    expect(styles.done).toBeTruthy();
    expect(row).toHaveClass(styles.done);
    expect(textStyles.strike).toBeTruthy();
    expect(screen.getByText("Read")).toHaveClass(textStyles.strike);
    expect(screen.getByText("Read")).toHaveClass(textStyles.muted);
  });

  it("unchecked has neither the done class nor a struck title", () => {
    render(<CheckboxRow title="Read" meta="9:30 – 10:00 PM" checked={false} />);
    const row = screen.getByRole("checkbox").closest("label");
    expect(row).not.toHaveClass(styles.done);
    expect(screen.getByText("Read")).not.toHaveClass(textStyles.strike);
    expect(screen.getByText("Read")).not.toHaveClass(textStyles.muted);
  });

  it("renders the trailing slot", () => {
    render(
      <CheckboxRow
        title="Work"
        meta="9:00 AM – 6:00 PM"
        checked={false}
        trailing={<span data-testid="pill">Now</span>}
      />,
    );
    const row = screen.getByRole("checkbox").closest("label");
    expect(row).toContainElement(screen.getByTestId("pill"));
  });

  it("inert is natively disabled with no faded class", () => {
    render(
      <CheckboxRow
        title="Work"
        meta="9:00 AM – 6:00 PM"
        checked={false}
        inert
      />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Work" });
    expect(checkbox).toBeDisabled();
    expect(checkbox).not.toHaveAttribute("inert");
    expect(checkbox.closest("label")).not.toHaveClass(styles.disabled);
  });

  it("disabled is natively disabled and faded", () => {
    render(
      <CheckboxRow
        title="Work"
        meta="9:00 AM – 6:00 PM"
        checked={false}
        disabled
      />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Work" });
    expect(checkbox).toBeDisabled();
    expect(styles.disabled).toBeTruthy();
    expect(checkbox.closest("label")).toHaveClass(styles.disabled);
  });

  it("disabled and inert checkboxes are skipped by Tab", async () => {
    const user = userEvent.setup();
    render(
      <>
        <CheckboxRow title="Before" meta="a" checked={false} />
        <CheckboxRow title="Faded" meta="b" checked={false} disabled />
        <CheckboxRow title="Drawn only" meta="c" checked inert />
        <CheckboxRow title="After" meta="d" checked={false} />
      </>,
    );
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Before" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "After" })).toHaveFocus();
  });

  it("clicking an inert row does not change the checkbox", async () => {
    const user = userEvent.setup();
    render(
      <CheckboxRow
        title="Work"
        meta="9:00 AM – 6:00 PM"
        checked={false}
        inert
      />,
    );
    await user.click(screen.getByText("Work"));
    expect(screen.getByRole("checkbox", { name: "Work" })).not.toBeChecked();
  });
});
