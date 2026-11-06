import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "./i18n/index.ts";
import { LanguageSwitch } from "./LanguageSwitch.tsx";
import { StatusPage } from "./StatusPage.tsx";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 6, 14, 5));
});

afterEach(async () => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
  await i18n.changeLanguage("en");
});

function renderPage() {
  render(
    <>
      <LanguageSwitch />
      <StatusPage />
    </>,
  );
}

// fetch stays pending until the returned function answers it.
function holdHealthCheck(): (response: Response) => void {
  let respond: (response: Response) => void = () => {};
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve;
        }),
    ),
  );
  return (response) => respond(response);
}

function failHealthCheck() {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
  );
}

describe("LanguageSwitch", () => {
  it("switching to Português shows every text in pt-BR", async () => {
    const user = userEvent.setup();

    // Checking, then connected.
    const respond = holdHealthCheck();
    renderPage();
    expect(screen.getByText("Checking…")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Português" }));
    expect(screen.getByText("Verificando…")).toBeInTheDocument();

    respond(Response.json({ status: "ok", db: "ok" }));
    expect(await screen.findByText("Servidor: conectado")).toBeInTheDocument();
    expect(screen.getByText("Banco de dados: conectado")).toBeInTheDocument();
    expect(screen.getByText("Verificado às 14:05")).toBeInTheDocument();

    // Can't connect.
    cleanup();
    await i18n.changeLanguage("en");
    failHealthCheck();
    renderPage();
    expect(
      await screen.findByText("Server: can't connect"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Português" }));
    expect(screen.getByText("Servidor: sem conexão")).toBeInTheDocument();
    expect(screen.getByText("Banco de dados: sem conexão")).toBeInTheDocument();
  });

  it("switching back to English shows every text in English", async () => {
    const user = userEvent.setup();

    // Checking, then connected.
    await i18n.changeLanguage("pt-BR");
    const respond = holdHealthCheck();
    renderPage();
    expect(screen.getByText("Verificando…")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByText("Checking…")).toBeInTheDocument();

    respond(Response.json({ status: "ok", db: "ok" }));
    expect(await screen.findByText("Server: connected")).toBeInTheDocument();
    expect(screen.getByText("Database: connected")).toBeInTheDocument();
    expect(screen.getByText("Checked at 2:05 PM")).toBeInTheDocument();

    // Can't connect.
    cleanup();
    await i18n.changeLanguage("pt-BR");
    failHealthCheck();
    renderPage();
    expect(
      await screen.findByText("Servidor: sem conexão"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByText("Server: can't connect")).toBeInTheDocument();
    expect(screen.getByText("Database: can't connect")).toBeInTheDocument();
  });
});
