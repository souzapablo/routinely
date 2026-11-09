import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.tsx";
import "./i18n/index.ts";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 8, 7, 48));
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) =>
      Promise.resolve(
        url === "/api/anchors"
          ? Response.json([], { status: 200 })
          : Response.json({ status: "ok", db: "ok" }, { status: 200 }),
      ),
    ),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("shows the planner at /", () => {
    renderAt("/");

    expect(screen.getByRole("banner")).toHaveTextContent("Routinely");
    expect(
      screen.getByRole("heading", { level: 1, name: "This week" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Routinely" }),
    ).not.toBeInTheDocument();
  });

  it("shows the status page at /status under the top bar", async () => {
    const { container } = renderAt("/status");

    const banner = screen.getByRole("banner");
    expect(await within(banner).findByText("Saved")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Português" })).toBeVisible();
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Routinely",
    });
    expect(
      banner.compareDocumentPosition(heading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(await screen.findByText("Server: connected")).toBeInTheDocument();
    expect(screen.getByText("Database: connected")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "This week" }),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll("main")).toHaveLength(1);
  });

  it("sends unknown paths to the planner", () => {
    renderAt("/no/such/page");

    expect(
      screen.getByRole("heading", { level: 1, name: "This week" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Routinely" }),
    ).not.toBeInTheDocument();
  });
});
