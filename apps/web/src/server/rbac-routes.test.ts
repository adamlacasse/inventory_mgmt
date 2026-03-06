import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errors";

vi.mock("./auth", () => ({
  requireSession: vi.fn(),
}));

vi.mock("./roles", () => ({
  requireRole: vi.fn(),
}));

vi.mock("./services", () => ({
  services: {
    products: {
      create: vi.fn(),
      list: vi.fn(),
    },
  },
}));

describe("product mutation route RBAC", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 403 when a viewer posts to the product create route", async () => {
    const { requireSession } = await import("./auth");
    const { requireRole } = await import("./roles");
    const { services } = await import("./services");
    const { POST } = await import("../../app/api/products/route");

    vi.mocked(requireSession).mockResolvedValue({
      id: "viewer-1",
      email: "viewer@example.com",
      name: "Viewer",
      role: "viewer",
    });
    vi.mocked(requireRole).mockImplementation(() => {
      throw new ApiError("FORBIDDEN", 403, "This action requires the 'operator' role or higher.");
    });

    const response = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: "Blue Dream",
          productCategory: "Flower",
          lotNumber: "LOT-100",
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "FORBIDDEN" },
    });
    expect(services.products.create).not.toHaveBeenCalled();
  });

  it("allows an operator to create a product", async () => {
    const { requireSession } = await import("./auth");
    const { requireRole } = await import("./roles");
    const { services } = await import("./services");
    const { POST } = await import("../../app/api/products/route");

    vi.mocked(requireSession).mockResolvedValue({
      id: "operator-1",
      email: "operator@example.com",
      name: "Operator",
      role: "operator",
    });
    vi.mocked(requireRole).mockImplementation(() => {});
    vi.mocked(services.products.create).mockResolvedValue({
      id: "product-1",
      productName: "Blue Dream",
      productCategory: "Flower",
      lotNumber: "LOT-100",
    } as never);

    const response = await POST(
      new Request("http://localhost/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: "Blue Dream",
          productCategory: "Flower",
          lotNumber: "LOT-100",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      product: { id: "product-1" },
    });
    expect(services.products.create).toHaveBeenCalledWith({
      productName: "Blue Dream",
      productCategory: "Flower",
      lotNumber: "LOT-100",
    });
  });
});
