import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("RootLayout", () => {
  it("suppresses hydration warnings on the html element", () => {
    const source = readFileSync(new URL("../../app/layout.tsx", import.meta.url), "utf8");

    expect(source).toContain('<html lang="en" suppressHydrationWarning>');
  });
});
