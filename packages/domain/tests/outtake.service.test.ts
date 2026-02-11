import { describe, expect, it, vi } from "vitest";
import type { InventoryRepository } from "../src/modules/inventory/repo";
import type { OuttakeRepository } from "../src/modules/outtake/repo";
import type { OuttakeDraftTransaction } from "../src/modules/outtake/schema";
import { createOuttakeService } from "../src/modules/outtake/service";

describe("outtake service", () => {
  it("creates a draft outtake when requested units equal units on hand", async () => {
    const save = vi.fn(async (_transaction: OuttakeDraftTransaction) => undefined);
    const outtakeRepository: OuttakeRepository = { save };
    const getUnitsOnHandByProduct = vi.fn(async (_productId: string) => 12);
    const inventoryRepository: InventoryRepository = { getUnitsOnHandByProduct };
    const service = createOuttakeService(outtakeRepository, inventoryRepository);

    const draftTransaction = await service.createDraftTransaction({
      date: new Date("2026-02-10T12:00:00.000Z"),
      notes: "Dispense",
      lineItems: [{ productId: "prod-001", units: 12 }],
    });

    expect(draftTransaction.id).toEqual(expect.any(String));
    expect(draftTransaction.type).toBe("outtake");
    expect(draftTransaction.status).toBe("draft");
    expect(draftTransaction.date.toISOString()).toBe("2026-02-10T12:00:00.000Z");
    expect(draftTransaction.notes).toBe("Dispense");
    expect(draftTransaction.lineItems).toEqual([{ productId: "prod-001", units: 12 }]);
    expect(getUnitsOnHandByProduct).toHaveBeenCalledWith("prod-001");
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith(draftTransaction);
  });

  it("rejects outtake requests that exceed units on hand", async () => {
    const save = vi.fn(async (_transaction: OuttakeDraftTransaction) => undefined);
    const outtakeRepository: OuttakeRepository = { save };
    const getUnitsOnHandByProduct = vi.fn(async (_productId: string) => 11);
    const inventoryRepository: InventoryRepository = { getUnitsOnHandByProduct };
    const service = createOuttakeService(outtakeRepository, inventoryRepository);

    await expect(
      service.createDraftTransaction({
        date: new Date("2026-02-10T12:00:00.000Z"),
        lineItems: [{ productId: "prod-001", units: 12 }],
      }),
    ).rejects.toMatchObject({
      name: "OuttakeValidationError",
      code: "OUTTAKE_INSUFFICIENT_INVENTORY",
      message: "Requested outtake units (12) exceed units on hand (11) for product prod-001.",
    });

    expect(save).not.toHaveBeenCalled();
  });

  it("rejects non-positive outtake units", async () => {
    const save = vi.fn(async (_transaction: OuttakeDraftTransaction) => undefined);
    const outtakeRepository: OuttakeRepository = { save };
    const getUnitsOnHandByProduct = vi.fn(async (_productId: string) => 20);
    const inventoryRepository: InventoryRepository = { getUnitsOnHandByProduct };
    const service = createOuttakeService(outtakeRepository, inventoryRepository);

    await expect(
      service.createDraftTransaction({
        date: new Date("2026-02-10T12:00:00.000Z"),
        lineItems: [{ productId: "prod-001", units: 0 }],
      }),
    ).rejects.toMatchObject({
      name: "OuttakeValidationError",
      code: "OUTTAKE_UNITS_MUST_BE_POSITIVE",
      message: "Each outtake line item requires units greater than zero.",
    });

    expect(getUnitsOnHandByProduct).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});
