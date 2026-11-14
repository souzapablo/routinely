import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectField } from "./SelectField.tsx";

const options = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "60", label: "1 h" },
  { value: "90", label: "1 h 30 min" },
];

describe("SelectField", () => {
  it("the label names a select showing the current option", () => {
    render(
      <SelectField
        label="Each time takes"
        options={options}
        value="60"
        onChange={() => {}}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Each time takes" });
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveValue("60");
    expect(screen.getByRole("option", { name: "1 h" })).toHaveProperty(
      "selected",
      true,
    );
  });

  it("lists the options in the order given", () => {
    render(
      <SelectField
        label="Each time takes"
        options={options}
        value="30"
        onChange={() => {}}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Each time takes" });
    const listed = within(select)
      .getAllByRole("option")
      .map((option) => [option.getAttribute("value"), option.textContent]);
    expect(listed).toEqual([
      ["15", "15 min"],
      ["30", "30 min"],
      ["60", "1 h"],
      ["90", "1 h 30 min"],
    ]);
  });

  it("choosing an option calls onChange with its value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SelectField
        label="Each time takes"
        options={options}
        value="30"
        onChange={onChange}
      />,
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Each time takes" }),
      "1 h 30 min",
    );
    expect(onChange).toHaveBeenCalledWith("90");
  });
});
