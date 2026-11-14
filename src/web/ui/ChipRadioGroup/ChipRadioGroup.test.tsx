import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChipRadioGroup, type ChipRadioOption } from "./ChipRadioGroup.tsx";

const options: ChipRadioOption<string>[] = [
  { value: "movement", label: "Movement", tone: "movement" },
  { value: "home", label: "Home", tone: "home" },
  { value: "errands", label: "Errands", tone: "errands" },
  { value: "rest", label: "Rest", tone: "rest" },
  { value: "people", label: "People", tone: "people" },
];

function chipOf(name: string): HTMLLabelElement {
  const label = screen.getByRole<HTMLInputElement>("radio", { name })
    .labels?.[0];
  if (!label) throw new Error(`${name} has no label`);
  return label;
}

describe("ChipRadioGroup", () => {
  it("is a group named by its legend with one radio per chip, named by its label", () => {
    render(
      <ChipRadioGroup
        legend="Kind"
        options={options}
        value="movement"
        onChange={() => {}}
      />,
    );
    const group = screen.getByRole("group", { name: "Kind" });
    expect(group.tagName).toBe("FIELDSET");
    const radios = screen.getAllByRole("radio");
    expect(radios.map((radio) => radio.getAttribute("value"))).toEqual([
      "movement",
      "home",
      "errands",
      "rest",
      "people",
    ]);
    for (const name of ["Movement", "Home", "Errands", "Rest", "People"]) {
      expect(group).toContainElement(screen.getByRole("radio", { name }));
    }
  });

  it("checks only the chip that matches value", () => {
    render(
      <ChipRadioGroup
        legend="Kind"
        options={options}
        value="rest"
        onChange={() => {}}
      />,
    );
    expect(
      screen
        .getAllByRole("radio")
        .filter((radio) => (radio as HTMLInputElement).checked)
        .map((radio) => radio.getAttribute("value")),
    ).toEqual(["rest"]);
  });

  it.each([
    ["Movement", "sage"],
    ["Home", "sky"],
    ["Errands", "apricot"],
    ["Rest", "lilac"],
    ["People", "rose"],
  ])("draws %s in the %s tone's colors", (name, tone) => {
    render(
      <ChipRadioGroup
        legend="Kind"
        options={options}
        value="movement"
        onChange={() => {}}
      />,
    );
    const chip = chipOf(name);
    expect(chip.style.getPropertyValue("--tone-bg")).toBe(`var(--${tone}-bg)`);
    expect(chip.style.getPropertyValue("--tone-ink")).toBe(
      `var(--${tone}-ink)`,
    );
    expect(chip.style.getPropertyValue("--tone-line")).toBe(
      `var(--${tone}-line)`,
    );
  });

  it("clicking a chip calls onChange with its value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ChipRadioGroup
        legend="Kind"
        options={options}
        value="movement"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByText("Errands"));
    expect(onChange).toHaveBeenCalledWith("errands");
  });
});
