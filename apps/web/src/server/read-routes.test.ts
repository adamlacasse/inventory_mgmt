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
    history: {
      list: vi.fn(),
    },
    inventory: {
      list: vi.fn(),
    },
    products: {
      list: vi.fn(),
    },
    reporting: {
      inventoryCsv: vi.fn(),
    },
  },
}));

describe("protected read routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 for unauthenticated inventory reads", async () => {
    const { requireSession } = await import("./auth");
    const { services } = await import("./services");
    const { GET } = await import("../../app/api/inventory/route");

    vi.mocked(requireSession).mockRejectedValue(
      new ApiError("UNAUTHENTICATED", 401, "Authentication required."),
    );

    const response = await GET(new Request("http://localhost/api/inventory"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "UNAUTHENTICATED" },
    });
    expect(services.inventory.list).not.toHaveBeenCalled();
  });

  it("allows a viewer to load protected read routes", async () => {
    const { requireSession } = await import("./auth");
    const { requireRole } = await import("./roles");
    const { services } = await import("./services");
    const inventoryRoute = await import("../../app/api/inventory/route");
    const historyRoute = await import("../../app/api/history/route");
    const productsRoute = await import("../../app/api/products/route");
    const reportRoute = await import("../../app/api/reports/inventory/route");

    vi.mocked(requireSession).mockResolvedValue({
      id: "viewer-1",
      email: "viewer@example.com",
      name: "Viewer",
      role: "viewer",
    });
    vi.mocked(requireRole).mockImplementation(() => {});
    vi.mocked(services.inventory.list).mockResolvedValue([
      {
        productId: "product-1",
        productName: "Blue Dream",
        category: "Flower",
        lot: "LOT-100",
        unitsOnHand: 4,
      },
    ] as never);
    vi.mocked(services.history.list).mockResolvedValue([
      {
        id: "txn-1",
        type: "intake",
        date: "2026-03-08T00:00:00.000Z",
        locked: true,
        notes: "Loaded",
        lineItems: [],
      },
    ] as never);
    vi.mocked(services.products.list).mockResolvedValue([
      {
        id: "product-1",
        productName: "Blue Dream",
        productCategory: "Flower",
        lotNumber: "LOT-100",
      },
    ] as never);
    vi.mocked(services.reporting.inventoryCsv).mockResolvedValue(
      "Product Name,Category,Lot,Units On Hand\nBlue Dream,Flower,LOT-100,4" as never,
    );

    const inventoryResponse = await inventoryRoute.GET(
      new Request("http://localhost/api/inventory?includeZero=false"),
    );
    const historyResponse = await historyRoute.GET(
      new Request("http://localhost/api/history?type=all"),
    );
    const productsResponse = await productsRoute.GET();
    const reportResponse = await reportRoute.GET(
      new Request("http://localhost/api/reports/inventory"),
    );

    expect(inventoryResponse.status).toBe(200);
    await expect(inventoryResponse.json()).resolves.toMatchObject({
      rows: [{ productId: "product-1" }],
    });

    expect(historyResponse.status).toBe(200);
    await expect(historyResponse.json()).resolves.toMatchObject({
      transactions: [{ id: "txn-1" }],
    });

    expect(productsResponse.status).toBe(200);
    await expect(productsResponse.json()).resolves.toMatchObject({
      products: [{ id: "product-1" }],
    });

    expect(reportResponse.status).toBe(200);
    await expect(reportResponse.text()).resolves.toContain("Blue Dream,Flower,LOT-100,4");

    expect(requireRole).toHaveBeenCalledTimes(4);
    expect(services.inventory.list).toHaveBeenCalledTimes(1);
    expect(services.history.list).toHaveBeenCalledTimes(1);
    expect(services.products.list).toHaveBeenCalledTimes(1);
    expect(services.reporting.inventoryCsv).toHaveBeenCalledTimes(1);
  });
});
