import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { resolvePrismaDatabaseUrl } from "./database-url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("resolvePrismaDatabaseUrl", () => {
  it("defaults to the package dev database", () => {
    expect(resolvePrismaDatabaseUrl(undefined)).toBe(
      `file:${path.join(packageRoot, "prisma", "dev.db")}`,
    );
  });

  it("expands relative sqlite paths against the package root", () => {
    expect(resolvePrismaDatabaseUrl("file:./prisma/dev.db")).toBe(
      `file:${path.join(packageRoot, "prisma", "dev.db")}`,
    );
  });

  it("preserves absolute sqlite paths", () => {
    expect(resolvePrismaDatabaseUrl("file:/tmp/custom.db")).toBe("file:/tmp/custom.db");
  });

  it("preserves non-sqlite urls", () => {
    expect(resolvePrismaDatabaseUrl("libsql://example.turso.io")).toBe(
      "libsql://example.turso.io",
    );
  });
});
