import { describe, expect, it } from "vitest";
import { ApiError } from "./errors";
import { parseCreateProductInput, parseUpdateProductInput } from "./products";

describe("products parsing", () => {
  it("parses create payload and trims fields", () => {
    const parsed = parseCreateProductInput({
      productName: " Blue Dream ",
      productCategory: " Flower ",
      lotNumber: " LOT-100 ",
    });

    expect(parsed).toEqual({
      productName: "Blue Dream",
      productCategory: "Flower",
      lotNumber: "LOT-100",
    });
  });

  it("rejects invalid create payload", () => {
    expect(() =>
      parseCreateProductInput({
        productName: "Blue Dream",
        productCategory: "",
        lotNumber: "LOT-100",
      }),
    ).toThrowError(ApiError);
  });

  it("requires at least one update field", () => {
    expect(() => parseUpdateProductInput({})).toThrowError(ApiError);
  });
});
