import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ApiError } from "../../src/server/errors";
import { prisma } from "../../src/server/prisma";
import { services } from "../../src/server/services";

async function ensureSchema() {
  const statements = [
    "PRAGMA foreign_keys = ON;",
    `CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY,
      productName TEXT NOT NULL,
      productCategory TEXT NOT NULL,
      lotNumber TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS Product_productName_productCategory_lotNumber_key
      ON Product(productName, productCategory, lotNumber);`,
    `CREATE TABLE IF NOT EXISTS IntakeTransaction (
      id TEXT PRIMARY KEY,
      date DATETIME NOT NULL,
      notes TEXT,
      saved BOOLEAN NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS OuttakeTransaction (
      id TEXT PRIMARY KEY,
      date DATETIME NOT NULL,
      customer TEXT,
      notes TEXT,
      saved BOOLEAN NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS IntakeItem (
      id TEXT PRIMARY KEY,
      intakeTransactionId TEXT NOT NULL,
      productId TEXT NOT NULL,
      units DECIMAL NOT NULL,
      FOREIGN KEY (intakeTransactionId) REFERENCES IntakeTransaction(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS OuttakeItem (
      id TEXT PRIMARY KEY,
      outtakeTransactionId TEXT NOT NULL,
      productId TEXT NOT NULL,
      units DECIMAL NOT NULL,
      FOREIGN KEY (outtakeTransactionId) REFERENCES OuttakeTransaction(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
  ];

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

describe("MVP smoke workflow", () => {
  beforeAll(async () => {
    await ensureSchema();
    await prisma.outtakeItem.deleteMany();
    await prisma.intakeItem.deleteMany();
    await prisma.outtakeTransaction.deleteMany();
    await prisma.intakeTransaction.deleteMany();
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("runs product -> intake -> outtake -> inventory -> lock/unlock -> csv", async () => {
    const product = await services.products.create({
      productName: "Blue Dream",
      productCategory: "Flower",
      lotNumber: "LOT-100",
    });

    expect(product.id).toEqual(expect.any(String));

    const intake = await services.intake.create({
      date: "2026-02-12",
      notes: "Initial intake",
      lineItems: [{ productId: product.id, units: 10 }],
      save: true,
    });

    expect(intake.locked).toBe(true);

    await expect(
      services.outtake.create({
        date: "2026-02-13",
        customer: "Walk-in",
        lineItems: [{ productId: product.id, units: 99 }],
        save: true,
      }),
    ).rejects.toMatchObject({
      code: "OUTTAKE_INSUFFICIENT_INVENTORY",
    } satisfies Partial<ApiError>);

    const outtake = await services.outtake.create({
      date: "2026-02-13",
      customer: "Walk-in",
      lineItems: [{ productId: product.id, units: 4 }],
      save: true,
    });

    expect(outtake.locked).toBe(true);

    const rows = await services.inventory.list(new URLSearchParams());
    expect(rows).toEqual([
      {
        productId: product.id,
        productName: "Blue Dream",
        category: "Flower",
        lot: "LOT-100",
        unitsOnHand: 6,
      },
    ]);

    const unlocked = await services.transactions.unlock("outtake", outtake.id);
    expect(unlocked.locked).toBe(false);

    const editedOuttake = await services.outtake.update(outtake.id, {
      lineItems: [{ productId: product.id, units: 3 }],
      save: true,
      customer: "Updated Customer",
    });

    expect(editedOuttake.locked).toBe(true);

    const relocked = await services.transactions.lock("outtake", outtake.id);
    expect(relocked.locked).toBe(true);

    const history = await services.history.list(new URLSearchParams());
    expect(history.length).toBe(2);

    const csv = await services.reporting.inventoryCsv(new URLSearchParams());
    expect(csv).toContain("Product Name,Category,Lot,Units On Hand");
    expect(csv).toContain("Blue Dream,Flower,LOT-100,7");
  });
});
