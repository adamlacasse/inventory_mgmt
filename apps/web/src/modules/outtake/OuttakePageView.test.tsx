import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OuttakePageView } from "./OuttakePageView";

describe("OuttakePageView", () => {
  it("renders outtake headings", () => {
    const html = renderToStaticMarkup(<OuttakePageView />);

    expect(html).toContain("Add Outtake");
    expect(html).toContain("Line Items");
  });
});
