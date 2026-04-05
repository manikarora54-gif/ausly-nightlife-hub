import { describe, it, expect } from "vitest";
import {
  escapeIlike,
  normalizeSearch,
  tokenize,
  buildOrFilter,
  prepareSearchTokens,
} from "../searchUtils";

describe("normalizeSearch", () => {
  it("trims whitespace", () => {
    expect(normalizeSearch("  foo  ")).toBe("foo");
  });
  it("collapses internal whitespace", () => {
    expect(normalizeSearch("foo   bar")).toBe("foo bar");
  });
  it("returns empty for whitespace-only", () => {
    expect(normalizeSearch("   ")).toBe("");
  });
  it("returns empty for null/undefined", () => {
    expect(normalizeSearch(null)).toBe("");
    expect(normalizeSearch(undefined)).toBe("");
  });
});

describe("escapeIlike", () => {
  it("escapes %", () => {
    expect(escapeIlike("50%")).toBe("50\\%");
  });
  it("escapes _", () => {
    expect(escapeIlike("a_b")).toBe("a\\_b");
  });
  it("escapes backslash", () => {
    expect(escapeIlike("a\\b")).toBe("a\\\\b");
  });
  it("escapes all together", () => {
    expect(escapeIlike("50%_\\")).toBe("50\\%\\_\\\\");
  });
  it("passes plain text through", () => {
    expect(escapeIlike("hello")).toBe("hello");
  });
});

describe("tokenize", () => {
  it("splits on whitespace", () => {
    expect(tokenize("berlin club")).toEqual(["berlin", "club"]);
  });
  it("deduplicates case-insensitively", () => {
    expect(tokenize("Berlin berlin BERLIN")).toEqual(["Berlin"]);
  });
  it("returns empty for empty input", () => {
    expect(tokenize("")).toEqual([]);
  });
  it("caps at 8 tokens", () => {
    const input = "a b c d e f g h i j k";
    expect(tokenize(input).length).toBe(8);
  });
});

describe("buildOrFilter", () => {
  it("builds correct filter string", () => {
    expect(buildOrFilter("foo", ["name", "description"])).toBe(
      "name.ilike.%foo%,description.ilike.%foo%"
    );
  });
});

describe("prepareSearchTokens", () => {
  it("returns null for empty/whitespace", () => {
    expect(prepareSearchTokens("")).toBeNull();
    expect(prepareSearchTokens("   ")).toBeNull();
    expect(prepareSearchTokens(undefined)).toBeNull();
  });
  it("returns escaped tokens", () => {
    expect(prepareSearchTokens("berlin 50%")).toEqual(["berlin", "50\\%"]);
  });
  it("normalizes before tokenizing", () => {
    expect(prepareSearchTokens("  foo   bar  ")).toEqual(["foo", "bar"]);
  });
});
