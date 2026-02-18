import {
  createIntakeTransaction,
  parseCreateIntakeInput,
  parseUpdateIntakeInput,
  updateIntakeTransaction,
} from "./intake";
import { getInventorySnapshot } from "./inventory";
import {
  createOuttakeTransaction,
  parseCreateOuttakeInput,
  parseUpdateOuttakeInput,
  updateOuttakeTransaction,
} from "./outtake";
import { prisma } from "./prisma";
import {
  createProduct,
  listProducts,
  parseCreateProductInput,
  parseUpdateProductInput,
  updateProduct,
} from "./products";
import { exportInventoryCsv } from "./reporting";
import {
  getTransactionHistory,
  parseHistoryFilters,
  setTransactionLockState,
} from "./transactions";

export function createServiceContainer() {
  function readInventoryFilters(query: URLSearchParams) {
    const productName = query.get("productName");
    const category = query.get("category");
    const lot = query.get("lot");

    return {
      ...(productName ? { productName } : {}),
      ...(category ? { category } : {}),
      ...(lot ? { lot } : {}),
      includeZero: query.get("includeZero") === "true",
    };
  }

  return {
    products: {
      list: () => listProducts(prisma),
      create: (payload: unknown) => createProduct(prisma, parseCreateProductInput(payload)),
      update: (id: string, payload: unknown) =>
        updateProduct(prisma, id, parseUpdateProductInput(payload)),
    },
    intake: {
      create: (payload: unknown) =>
        createIntakeTransaction(prisma, parseCreateIntakeInput(payload)),
      update: (id: string, payload: unknown) =>
        updateIntakeTransaction(prisma, id, parseUpdateIntakeInput(payload)),
    },
    outtake: {
      create: (payload: unknown) =>
        createOuttakeTransaction(prisma, parseCreateOuttakeInput(payload)),
      update: (id: string, payload: unknown) =>
        updateOuttakeTransaction(prisma, id, parseUpdateOuttakeInput(payload)),
    },
    inventory: {
      list: (query: URLSearchParams) => getInventorySnapshot(prisma, readInventoryFilters(query)),
    },
    history: {
      list: (query: URLSearchParams) => getTransactionHistory(prisma, parseHistoryFilters(query)),
    },
    transactions: {
      lock: (type: "intake" | "outtake", id: string) =>
        setTransactionLockState(prisma, type, id, true),
      unlock: (type: "intake" | "outtake", id: string) =>
        setTransactionLockState(prisma, type, id, false),
    },
    reporting: {
      inventoryCsv: (query: URLSearchParams) =>
        exportInventoryCsv(prisma, readInventoryFilters(query)),
    },
  };
}

export const services = createServiceContainer();
