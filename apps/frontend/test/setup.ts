import "@testing-library/jest-dom/vitest"; // Extends Vitest's expect with jest-dom matchers

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Optional: If you want to ensure cleanup runs after each test,
// though React Testing Library often handles this automatically with modern frameworks.
// It's good practice for safety.
afterEach(() => {
  cleanup(); // Unmounts React trees that were mounted with render
  vi.clearAllMocks();
});
