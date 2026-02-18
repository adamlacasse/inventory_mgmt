import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { ApiError } from "./errors";

export interface ProductInput {
  productName: string;
  productCategory: string;
  lotNumber: string;
}

function parseNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ApiError("INVALID_PAYLOAD", 400, `${field} must be a string.`);
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ApiError("INVALID_PAYLOAD", 400, `${field} is required.`);
  }

  return trimmed;
}

function parsePayload(payload: unknown): Record<string, unknown> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new ApiError("INVALID_PAYLOAD", 400, "Payload must be an object.");
  }

  return payload as Record<string, unknown>;
}

export function parseCreateProductInput(payload: unknown): ProductInput {
  const data = parsePayload(payload);

  return {
    productName: parseNonEmptyString(data.productName, "productName"),
    productCategory: parseNonEmptyString(data.productCategory, "productCategory"),
    lotNumber: parseNonEmptyString(data.lotNumber, "lotNumber"),
  };
}

export function parseUpdateProductInput(payload: unknown): Partial<ProductInput> {
  const data = parsePayload(payload);
  const update: Partial<ProductInput> = {};

  if ("productName" in data) {
    update.productName = parseNonEmptyString(data.productName, "productName");
  }

  if ("productCategory" in data) {
    update.productCategory = parseNonEmptyString(data.productCategory, "productCategory");
  }

  if ("lotNumber" in data) {
    update.lotNumber = parseNonEmptyString(data.lotNumber, "lotNumber");
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError("INVALID_PAYLOAD", 400, "At least one updatable field is required.");
  }

  return update;
}

function mapProductError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new ApiError(
      "PRODUCT_IDENTITY_CONFLICT",
      409,
      "A product with the same name, category, and lot already exists.",
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    throw new ApiError("PRODUCT_NOT_FOUND", 404, "Product not found.");
  }

  throw new ApiError("INTERNAL_ERROR", 500, "Unexpected product error.");
}

export async function listProducts(client: PrismaClient) {
  return client.product.findMany({
    orderBy: [{ productName: "asc" }, { productCategory: "asc" }, { lotNumber: "asc" }],
  });
}

export async function createProduct(client: PrismaClient, input: ProductInput) {
  try {
    return await client.product.create({
      data: input,
    });
  } catch (error) {
    mapProductError(error);
  }
}

export async function updateProduct(
  client: PrismaClient,
  productId: string,
  update: Partial<ProductInput>,
) {
  const trimmedId = productId.trim();
  if (trimmedId.length === 0) {
    throw new ApiError("PRODUCT_ID_REQUIRED", 400, "Product id is required.");
  }

  try {
    return await client.product.update({
      where: { id: trimmedId },
      data: update,
    });
  } catch (error) {
    mapProductError(error);
  }
}

export async function ensureProductExists(client: PrismaClient, input: ProductInput) {
  const existing = await client.product.findUnique({
    where: {
      productName_productCategory_lotNumber: {
        productName: input.productName,
        productCategory: input.productCategory,
        lotNumber: input.lotNumber,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return createProduct(client, input);
}
