import { describe, expect, it } from "vitest";
import { GET } from "../../app/favicon.ico/route";

describe("favicon route", () => {
  it("redirects favicon requests to the generated app icon", () => {
    const response = GET(new Request("http://localhost:3000/favicon.ico"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost:3000/icon.svg");
  });
});
