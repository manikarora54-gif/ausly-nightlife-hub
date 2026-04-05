/**
 * Shared search utilities for Supabase ILIKE filter composition.
 *
 * Design decisions:
 * - **Token limit**: max 8 tokens to keep PostgREST filter strings reasonable
 *   and prevent overly broad / expensive queries.
 * - **Escape**: %, _, and \ are escaped so user input is matched literally.
 * - **Debounce**: callers (e.g. Discover page) should debounce the `search`
 *   value before passing it into hooks to avoid per-keystroke queries.
 */

/**
 * Escape ILIKE special characters so they are matched literally.
 * PostgreSQL ILIKE treats %, _, and \ as wildcards / escapes.
 */
export function escapeIlike(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Normalize a search string: trim, collapse internal whitespace,
 * return empty string for whitespace-only input.
 */
export function normalizeSearch(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw.trim().replace(/\s+/g, " ");
}

/** Max tokens extracted from a single search string. */
const MAX_TOKENS = 8;

/**
 * Split a normalized search string into unique, non-empty tokens.
 * Returns at most MAX_TOKENS items.
 */
export function tokenize(normalized: string): string[] {
  if (!normalized) return [];
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const t of normalized.split(" ")) {
    const lower = t.toLowerCase();
    if (lower && !seen.has(lower)) {
      seen.add(lower);
      tokens.push(t);
      if (tokens.length >= MAX_TOKENS) break;
    }
  }
  return tokens;
}

/**
 * Build a PostgREST `or` filter string for a single token across
 * multiple columns. Each column gets `column.ilike.%token%`.
 *
 * Example: buildOrFilter("foo", ["name","description"])
 *   → "name.ilike.%foo%,description.ilike.%foo%"
 */
export function buildOrFilter(escapedToken: string, columns: string[]): string {
  return columns.map((col) => `${col}.ilike.%${escapedToken}%`).join(",");
}

/**
 * Prepare a search string for use with Supabase query builder.
 *
 * Returns `null` when the search is effectively empty (caller should
 * skip adding any search filters), or an array of escaped tokens.
 */
export function prepareSearchTokens(
  raw: string | undefined | null
): string[] | null {
  const normalized = normalizeSearch(raw);
  if (!normalized) return null;
  const tokens = tokenize(normalized);
  if (tokens.length === 0) return null;
  return tokens.map(escapeIlike);
}
