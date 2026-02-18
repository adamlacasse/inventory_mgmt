import { describe, expect, it, vi } from "vitest";
import { type IntakeValidationError, createIntakeService } from "../src/modules/intake/service";

describe("intake service", () => {
  it("creates a draft intake transaction with line items", async () => {
    const repository = {
      save: vi.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    };
    const service = createIntakeService(repository);

    const draftTransaction = await service.createDraftTransaction({
      date: new Date("2026-02-10T12:00:00.000Z"),
      notes: "Initial transfer",
      lineItems: [{ productId: "prod-001", units: 10 }],
    });

    expect(draftTransaction.id).toEqual(expect.any(String));
    expect(draftTransaction.type).toBe("intake");
    expect(draftTransaction.status).toBe("draft");
    expect(draftTransaction.date.toISOString()).toBe("2026-02-10T12:00:00.000Z");
    expect(draftTransaction.notes).toBe("Initial transfer");
    expect(draftTransaction.lineItems).toEqual([{ productId: "prod-001", units: 10 }]);
    expect(repository.save).toHaveBeenCalledOnce();
    expect(repository.save).toHaveBeenCalledWith(draftTransaction);
  });

  it("rejects payloads with empty line item arrays", async () => {
    const repository = {
      save: vi.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    };
    const service = createIntakeService(repository);

    await expect(
      service.createDraftTransaction({
        date: new Date("2026-02-10T12:00:00.000Z"),
        lineItems: [],
      }),
    ).rejects.toMatchObject({
      name: "IntakeValidationError",
      code: "INTAKE_LINE_ITEMS_REQUIRED",
      message: "Intake transaction requires at least one line item.",
    } satisfies Partial<IntakeValidationError>);
  });

  it("rejects payloads with missing productId", async () => {
    const repository = {
      save: vi.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    };
    const service = createIntakeService(repository);

    await expect(
      service.createDraftTransaction({
        date: new Date("2026-02-10T12:00:00.000Z"),
        lineItems: [{ productId: " ", units: 2 }],
      }),
    ).rejects.toMatchObject({
      name: "IntakeValidationError",
      code: "INTAKE_PRODUCT_ID_REQUIRED",
      message: "Each intake line item requires a productId.",
    } satisfies Partial<IntakeValidationError>);
  });

  it("rejects payloads with non-positive units", async () => {
    const repository = {
      save: vi.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue(undefined),
    };
    const service = createIntakeService(repository);

    await expect(
      service.createDraftTransaction({
        date: new Date("2026-02-10T12:00:00.000Z"),
        lineItems: [{ productId: "prod-001", units: 0 }],
      }),
    ).rejects.toMatchObject({
      name: "IntakeValidationError",
      code: "INTAKE_UNITS_MUST_BE_POSITIVE",
      message: "Each intake line item requires units greater than zero.",
    } satisfies Partial<IntakeValidationError>);
  });
});
