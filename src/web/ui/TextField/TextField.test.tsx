import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField.tsx";

describe("TextField", () => {
  it("the label names a text input showing the value", () => {
    render(<TextField label="Name" value="Work" onChange={() => {}} />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveValue("Work");
  });

  it("sets maxLength on the input", () => {
    render(
      <TextField label="Name" value="" maxLength={60} onChange={() => {}} />,
    );
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveAttribute(
      "maxlength",
      "60",
    );
  });

  it("typing calls onChange with the new text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField label="Name" value="" onChange={onChange} />);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "W");
    expect(onChange).toHaveBeenLastCalledWith("W");
  });

  it("the ref reaches the input so it can be focused", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="Name" value="" onChange={() => {}} ref={ref} />);
    ref.current?.focus();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
  });
});
