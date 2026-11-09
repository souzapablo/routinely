import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../Button/Button.tsx";
import { FieldGroup } from "./FieldGroup.tsx";

describe("FieldGroup", () => {
  it("is a group named by its legend that holds its children", () => {
    render(
      <FieldGroup legend="Repeats on">
        <Button pressed>Sun</Button>
        <Button pressed={false}>Mon</Button>
      </FieldGroup>,
    );
    const group = screen.getByRole("group", { name: "Repeats on" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).toContainElement(screen.getByRole("button", { name: "Sun" }));
    expect(group).toContainElement(screen.getByRole("button", { name: "Mon" }));
  });
});
