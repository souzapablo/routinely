import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "web",
          environment: "jsdom",
          include: ["src/web/**/*.test.{ts,tsx}"],
          setupFiles: ["src/web/test-setup.ts"],
        },
      },
      {
        test: {
          name: "server",
          environment: "node",
          include: ["src/server/**/*.test.ts", "test/**/*.test.ts"],
        },
      },
    ],
  },
});
