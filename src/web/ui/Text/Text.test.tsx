import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text, type TextProps } from "./Text.tsx";
import styles from "./Text.module.css";

function renderText(props: Omit<TextProps, "children"> = {}): HTMLElement {
  render(<Text {...props}>Run 5 km</Text>);
  return screen.getByText("Run 5 km");
}

describe("Text", () => {
  it("renders a p by default with its children", () => {
    const element = renderText();
    expect(element.tagName).toBe("P");
    expect(element).toHaveTextContent("Run 5 km");
  });

  it.each(["p", "span", "div"] as const)("renders as %s when asked", (as) => {
    expect(renderText({ as }).tagName).toBe(as.toUpperCase());
  });

  it("passes element children through", () => {
    render(
      <Text>
        Today · <strong>Sunday</strong>
      </Text>,
    );
    expect(screen.getByText("Sunday").tagName).toBe("STRONG");
  });

  it("carries only the base class without props, so the text inherits its look", () => {
    expect(styles.text).toBeTruthy();
    expect(renderText().className).toBe(styles.text);
  });

  const cases: [string, Omit<TextProps, "children">, string][] = [
    ["tone muted", { tone: "muted" }, "muted"],
    ["tone faint", { tone: "faint" }, "faint"],
    ["tone error", { tone: "error" }, "error"],
    ["size md", { size: "md" }, "md"],
    ["size sm", { size: "sm" }, "sm"],
    ["size xs", { size: "xs" }, "xs"],
    ["mono", { mono: true }, "mono"],
    ["weight regular", { weight: "regular" }, "regular"],
    ["weight medium", { weight: "medium" }, "medium"],
    ["weight semibold", { weight: "semibold" }, "semibold"],
    ["truncate", { truncate: true }, "truncate"],
    ["strike", { strike: true }, "strike"],
  ];

  it.each(cases)("%s adds its class", (_label, props, className) => {
    const expected = styles[className];
    expect(expected).toBeTruthy();
    expect(renderText(props)).toHaveClass(expected);
  });

  it("tone default adds no tone class", () => {
    const element = renderText({ tone: "default" });
    expect(element).not.toHaveClass(styles.muted);
    expect(element).not.toHaveClass(styles.faint);
    expect(element).not.toHaveClass(styles.error);
  });

  it("combines classes from several props", () => {
    const element = renderText({ tone: "muted", size: "xs", mono: true });
    expect(element).toHaveClass(styles.muted, styles.xs, styles.mono);
  });
});
