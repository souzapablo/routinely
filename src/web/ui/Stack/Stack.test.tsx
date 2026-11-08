import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stack, type StackProps } from "./Stack.tsx";
import styles from "./Stack.module.css";

function renderStack(props: Omit<StackProps, "children"> = {}): HTMLElement {
  render(
    <Stack data-testid="stack" {...props}>
      <span>One</span>
      <span>Two</span>
    </Stack>,
  );
  return screen.getByTestId("stack");
}

describe("Stack", () => {
  it("renders a div with its children by default", () => {
    const stack = renderStack();
    expect(stack.tagName).toBe("DIV");
    expect(stack).toHaveTextContent("OneTwo");
  });

  it.each(["div", "section", "header", "aside", "nav"] as const)(
    "renders as %s when asked",
    (as) => {
      expect(renderStack({ as }).tagName).toBe(as.toUpperCase());
    },
  );

  it("carries only the base class without props, so it stacks in a column", () => {
    expect(styles.stack).toBeTruthy();
    expect(renderStack().className).toBe(styles.stack);
  });

  it("adds the row class for a row", () => {
    expect(styles.row).toBeTruthy();
    expect(renderStack({ direction: "row" }).className).toBe(
      `${styles.stack} ${styles.row}`,
    );
  });

  it("adds no direction class for a column", () => {
    expect(renderStack({ direction: "column" }).className).toBe(styles.stack);
  });

  const gaps = [0, 1, 2, 3, 4, 5, 6, 7] as const;

  it.each(gaps)("gap %i adds its own class only", (gap) => {
    const stack = renderStack({ gap });
    expect(styles[`gap${gap}`]).toBeTruthy();
    expect(stack).toHaveClass(styles.stack, styles[`gap${gap}`]);
    for (const other of gaps.filter((g) => g !== gap)) {
      expect(stack).not.toHaveClass(styles[`gap${other}`]);
    }
  });

  const cases: [string, Omit<StackProps, "children">, string][] = [
    ["align start", { align: "start" }, "alignStart"],
    ["align center", { align: "center" }, "alignCenter"],
    ["align end", { align: "end" }, "alignEnd"],
    ["align stretch", { align: "stretch" }, "alignStretch"],
    ["align baseline", { align: "baseline" }, "alignBaseline"],
    ["justify start", { justify: "start" }, "justifyStart"],
    ["justify center", { justify: "center" }, "justifyCenter"],
    ["justify end", { justify: "end" }, "justifyEnd"],
    ["justify between", { justify: "between" }, "justifyBetween"],
    ["wrap", { wrap: true }, "wrap"],
  ];

  it.each(cases)("%s adds its class", (_name, props, className) => {
    expect(styles[className]).toBeTruthy();
    expect(renderStack(props).className).toBe(
      `${styles.stack} ${styles[className]}`,
    );
  });

  it("passes aria-labelledby through so a landmark can be named", () => {
    render(
      <Stack as="section" aria-labelledby="today-h">
        <h3 id="today-h">Today</h3>
      </Stack>,
    );
    expect(screen.getByRole("region", { name: "Today" }).tagName).toBe(
      "SECTION",
    );
  });
});
