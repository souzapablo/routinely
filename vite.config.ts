import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { apiPathPattern } from "./src/shared/apiPath.ts";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/web",
    emptyOutDir: true,
  },
  server: {
    // In development the API runs separately on port 3000 (npm run dev).
    // A key starting with ^ is a regular expression to Vite.
    proxy: { [apiPathPattern.source]: "http://localhost:3000" },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "web",
          environment: "jsdom",
          include: ["src/web/**/*.test.{ts,tsx}"],
          setupFiles: ["src/web/test-setup.ts"],
          // Vitest empties CSS by default, `?raw` included; tokens.test.ts
          // reads tokens.css as text.
          css: { include: [/src\/web\/ui\/styles\/.+\.css/] },
        },
      },
      {
        test: {
          name: "server",
          environment: "node",
          include: [
            "src/server/**/*.test.ts",
            "src/shared/**/*.test.ts",
            "test/**/*.test.ts",
          ],
        },
      },
    ],
  },
});
