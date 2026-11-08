import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisuallyHidden } from "./VisuallyHidden.tsx";
import styles from "./VisuallyHidden.module.css";

describe("VisuallyHidden", () => {
  it("keeps its text in the page for screen readers, under the hiding class", () => {
    render(<VisuallyHidden>3 of 7 days</VisuallyHidden>);
    const text = screen.getByText("3 of 7 days");
    expect(text.tagName).toBe("SPAN");
    expect(styles.hidden).toBeTruthy();
    expect(text).toHaveClass(styles.hidden);
  });
});
