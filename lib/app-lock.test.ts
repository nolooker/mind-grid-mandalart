import { describe, expect, it } from "vitest";
import { authorizePasscode } from "./app-lock";

describe("app lock", () => {
  it("accepts the configured passcode", () => {
    const request = new Request("https://example.com/api/mandalarts", {
      headers: { "x-mandalart-passcode": "secret-passcode" },
    });

    expect(authorizePasscode(request, "secret-passcode")).toBe(true);
  });

  it("rejects missing or incorrect passcodes", () => {
    expect(authorizePasscode(new Request("https://example.com/api/mandalarts"), "secret-passcode")).toBe(false);
    expect(authorizePasscode(new Request("https://example.com/api/mandalarts", { headers: { "x-mandalart-passcode": "wrong" } }), "secret-passcode")).toBe(false);
  });
});
