import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.tsx";
import "./i18n/index.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("renders the status page heading and both language buttons", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<Response>(() => {})),
    );

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Routinely" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Português" }),
    ).toBeInTheDocument();
  });
});
