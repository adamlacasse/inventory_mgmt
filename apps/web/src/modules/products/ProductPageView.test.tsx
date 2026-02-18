import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductPageView } from "./ProductPageView";

describe("ProductPageView", () => {
  it("renders product master headings", () => {
    const html = renderToStaticMarkup(<ProductPageView />);

    expect(html).toContain("Product Master");
    expect(html).toContain("Add Product");
    expect(html).toContain("Products");
  });
});
