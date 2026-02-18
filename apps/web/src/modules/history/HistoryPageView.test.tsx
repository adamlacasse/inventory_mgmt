import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HistoryPageView } from "./HistoryPageView";

describe("HistoryPageView", () => {
  it("renders history headings", () => {
    const html = renderToStaticMarkup(<HistoryPageView />);

    expect(html).toContain("Transaction History");
    expect(html).toContain("Filters");
  });
});
