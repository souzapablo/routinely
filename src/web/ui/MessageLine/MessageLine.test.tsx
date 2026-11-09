import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageLine } from "./MessageLine.tsx";
import styles from "./MessageLine.module.css";

describe("MessageLine", () => {
  it("renders an empty polite status region when there is no message", () => {
    render(<MessageLine />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toBeEmptyDOMElement();
  });

  it("keeps the same region when a message appears", () => {
    const { rerender } = render(<MessageLine />);
    const region = screen.getByRole("status");
    rerender(<MessageLine message="Pick at least one day it repeats on." />);
    expect(screen.getByRole("status")).toBe(region);
    expect(region).toHaveTextContent("Pick at least one day it repeats on.");
  });

  it("calm shows the message with an info icon and no error class", () => {
    render(
      <MessageLine
        tone="calm"
        message="Pick at least one day it repeats on."
      />,
    );
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("Pick at least one day it repeats on.");
    expect(region.querySelector("svg.lucide-info")).not.toBeNull();
    expect(styles.error).toBeTruthy();
    expect(region).not.toHaveClass(styles.error);
  });

  it("calm is the default tone", () => {
    render(<MessageLine message="Pick at least one day it repeats on." />);
    expect(screen.getByRole("status")).not.toHaveClass(styles.error);
  });

  it("error shows the message with the error class and no info icon", () => {
    render(
      <MessageLine
        tone="error"
        message="Not saved. Your changes are still here, so you can try again."
      />,
    );
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent(
      "Not saved. Your changes are still here, so you can try again.",
    );
    expect(region).toHaveClass(styles.error);
    expect(region.querySelector("svg")).toBeNull();
  });
});
