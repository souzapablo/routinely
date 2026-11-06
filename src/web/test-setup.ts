import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only unmounts rendered trees by itself when Vitest's
// globals are on; they are off here, so unmount after every test.
afterEach(cleanup);
