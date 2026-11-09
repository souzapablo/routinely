import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CoverButton } from "./CoverButton.tsx";
import styles from "./CoverButton.module.css";

function renderCover() {
  const onClick = vi.fn<() => void>();
  render(
    <div style={{ position: "relative" }}>
      <CoverButton label="Edit Work" onClick={onClick} />
    </div>,
  );
  return { onClick, button: screen.getByRole("button", { name: "Edit Work" }) };
}

describe("CoverButton", () => {
  it("is a native button of type button named by the label", () => {
    const { button } = renderCover();
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(styles.cover).toBeTruthy();
    expect(button).toHaveClass(styles.cover);
  });

  it("a click calls onClick", async () => {
    const user = userEvent.setup();
    const { onClick, button } = renderCover();
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each(["{Enter}", " "])("pressing %s calls onClick", async (key) => {
    const user = userEvent.setup();
    const { onClick, button } = renderCover();
    button.focus();
    await user.keyboard(key);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is in the Tab order", async () => {
    const user = userEvent.setup();
    const { button } = renderCover();
    await user.tab();
    expect(button).toHaveFocus();
  });
});
