import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading, type HeadingProps } from "./Heading.tsx";
import styles from "./Heading.module.css";

function renderHeading(props: Omit<HeadingProps, "children">): HTMLElement {
  render(<Heading {...props}>This week</Heading>);
  return screen.getByRole("heading", { name: "This week" });
}

describe("Heading", () => {
  it.each([
    [1, "H1"],
    [2, "H2"],
    [3, "H3"],
  ] as const)("level %i renders an %s", (level, tagName) => {
    const heading = renderHeading({ level });
    expect(heading.tagName).toBe(tagName);
    expect(heading).toHaveTextContent("This week");
  });

  it("carries only the base class without a size", () => {
    expect(styles.heading).toBeTruthy();
    expect(renderHeading({ level: 2 }).className).toBe(styles.heading);
  });

  const sizes = ["page", "section", "card"] as const;
  const levels = [1, 2, 3] as const;
  const cases = sizes.flatMap((size) =>
    levels.map((level) => [size, level] as const),
  );

  it.each(cases)("size %s adds its class at level %i", (size, level) => {
    const heading = renderHeading({ level, size });
    expect(styles[size]).toBeTruthy();
    expect(heading).toHaveClass(styles.heading, styles[size]);
    for (const other of sizes.filter((s) => s !== size)) {
      expect(heading).not.toHaveClass(styles[other]);
    }
  });

  it("passes id through so a section can be labelled by it", () => {
    expect(renderHeading({ level: 3, id: "today-h" })).toHaveAttribute(
      "id",
      "today-h",
    );
  });
});
