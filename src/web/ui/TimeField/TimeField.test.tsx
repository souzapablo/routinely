import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimeField } from "./TimeField.tsx";

describe("TimeField", () => {
  it("the label names a time input in 15-minute steps showing the value", () => {
    render(<TimeField label="Starts" value="09:00" onChange={() => {}} />);
    const input = screen.getByLabelText("Starts");
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("type", "time");
    expect(input).toHaveAttribute("step", "900");
    expect(input).toHaveValue("09:00");
  });

  it("changing it calls onChange with HH:MM", () => {
    const onChange = vi.fn();
    render(<TimeField label="Starts" value="09:00" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Starts"), {
      target: { value: "17:45" },
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("17:45");
  });

  it("clearing it calls onChange with an empty string", () => {
    const onChange = vi.fn();
    render(<TimeField label="Starts" value="09:00" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Starts"), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("");
  });

  it("an empty value shows an empty input", () => {
    render(<TimeField label="Ends" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Ends")).toHaveValue("");
  });
});
