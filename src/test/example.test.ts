import { describe, it, expect } from "vitest";

describe("Test setup", () => {
  it("should pass basic assertion", () => {
    expect(true).toBe(true);
  });

  it("should support arithmetic", () => {
    expect(1 + 1).toBe(2);
  });
});
