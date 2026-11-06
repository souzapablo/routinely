import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    // Fixed so the first-visit language (English) does not depend on the machine.
    locale: "en-US",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // The real production path: build the web app, then one Node process serves it and the API.
    command: "npm run build && npm start",
    url: `${baseURL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: String(port),
      // Kept out of the repo's data/ folder so e2e runs never touch the owner's database.
      DATABASE_PATH: join(tmpdir(), "routinely-e2e", "routinely.db"),
    },
  },
});
