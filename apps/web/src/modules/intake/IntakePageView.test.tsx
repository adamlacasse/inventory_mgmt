import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IntakePageView } from "./IntakePageView";

describe("IntakePageView", () => {
  it("renders intake headings", () => {
    const html = renderToStaticMarkup(<IntakePageView />);

    expect(html).toContain("Add Intake");
    expect(html).toContain("Line Items");
  });
});
