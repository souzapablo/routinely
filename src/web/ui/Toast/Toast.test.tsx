import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "./Toast.tsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast", () => {
  it("shows the message in a polite status region", () => {
    render(<Toast message="Saved Work." id={1} onDone={() => {}} />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("Saved Work.");
  });

  it("keeps an empty region when there is no message", () => {
    render(<Toast message={null} id={0} onDone={() => {}} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("calls onDone at 3400 ms, not before", () => {
    const onDone = vi.fn<() => void>();
    render(<Toast message="Saved Work." id={1} onDone={onDone} />);
    act(() => {
      vi.advanceTimersByTime(3399);
    });
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("a new id with the same text restarts the timer", () => {
    const onDone = vi.fn<() => void>();
    const { rerender } = render(
      <Toast message="Saved Work." id={1} onDone={onDone} />,
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender(<Toast message="Saved Work." id={2} onDone={onDone} />);
    act(() => {
      vi.advanceTimersByTime(3399);
    });
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("a new onDone function on re-render does not restart the timer", () => {
    const onDone = vi.fn<() => void>();
    const { rerender } = render(
      <Toast message="Saved Work." id={1} onDone={() => onDone()} />,
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender(<Toast message="Saved Work." id={1} onDone={() => onDone()} />);
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("does not call onDone while there is no message", () => {
    const onDone = vi.fn<() => void>();
    render(<Toast message={null} id={0} onDone={onDone} />);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onDone).not.toHaveBeenCalled();
  });
});
