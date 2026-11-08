import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const rawElements = [
  "button",
  "input",
  "select",
  "textarea",
  "a",
  "label",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
];

export default defineConfig(
  globalIgnores(["dist/", "data/", "test/fixtures/", "storybook-static/"]),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: [
          "./tsconfig.web.json",
          "./tsconfig.node.json",
          "./tsconfig.e2e.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/web/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
  },
  {
    // Only the design system may render raw controls and text, so every
    // screen gets them styled and accessible the same way.
    files: ["src/web/**/*.tsx"],
    ignores: ["src/web/ui/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...rawElements.map((name) => ({
          selector: `JSXOpeningElement > JSXIdentifier[name="${name}"]`,
          message: `Use a component from src/web/ui instead of <${name}>.`,
        })),
      ],
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
