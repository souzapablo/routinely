import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioCardGroup, type RadioCardOption } from "./RadioCardGroup.tsx";

const options: RadioCardOption<"anchor" | "flexible">[] = [
  {
    value: "anchor",
    title: "Anchor",
    description: "Same days and time every week. Can't be dragged.",
    icon: "lock",
  },
  {
    value: "flexible",
    title: "Flexible",
    description: "A goal for the week. Drag it wherever it fits.",
    icon: "moveHorizontal",
  },
];

describe("RadioCardGroup", () => {
  it("is a radio group named by its legend", () => {
    render(
      <RadioCardGroup
        legend="Type"
        options={options}
        value="anchor"
        onChange={() => {}}
      />,
    );
    const group = screen.getByRole("group", { name: "Type" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).toContainElement(
      screen.getByRole("radio", { name: "Anchor" }),
    );
    expect(group).toContainElement(
      screen.getByRole("radio", { name: "Flexible" }),
    );
  });

  it("names each radio by its title and describes it by its description", () => {
    render(
      <RadioCardGroup
        legend="Type"
        options={options}
        value="anchor"
        onChange={() => {}}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(
      screen.getByRole("radio", { name: "Anchor" }),
    ).toHaveAccessibleDescription(
      "Same days and time every week. Can't be dragged.",
    );
    expect(
      screen.getByRole("radio", { name: "Flexible" }),
    ).toHaveAccessibleDescription(
      "A goal for the week. Drag it wherever it fits.",
    );
  });

  it("checks the option that matches value", () => {
    const { rerender } = render(
      <RadioCardGroup
        legend="Type"
        options={options}
        value="anchor"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("radio", { name: "Anchor" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Flexible" })).not.toBeChecked();

    rerender(
      <RadioCardGroup
        legend="Type"
        options={options}
        value="flexible"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("radio", { name: "Anchor" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Flexible" })).toBeChecked();
  });

  it("clicking another card calls onChange with its value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioCardGroup
        legend="Type"
        options={options}
        value="anchor"
        onChange={onChange}
      />,
    );
    await user.click(
      screen.getByText("A goal for the week. Drag it wherever it fits."),
    );
    expect(onChange).toHaveBeenCalledWith("flexible");
  });

  it("an arrow key moves the choice to the next option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioCardGroup
        legend="Type"
        options={options}
        value="anchor"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "Anchor" }));
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("flexible");
  });
});
