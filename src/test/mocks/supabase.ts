import { vi } from "vitest";

// Chainable query builder mock
export function createQueryMock(resolvedValue: any = { data: [], error: null }) {
  const chain: any = {};
  const methods = [
    "select", "insert", "update", "delete", "upsert",
    "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike",
    "in", "is", "order", "limit", "range", "single", "maybeSingle",
    "filter", "not", "or", "match", "textSearch",
  ];
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  // Terminal: return resolved value
  chain.then = (resolve: any) => resolve(resolvedValue);
  // Allow awaiting
  chain[Symbol.toStringTag] = "Promise";
  // Make it thenable
  Object.defineProperty(chain, "then", {
    value: (onFulfilled: any, onRejected?: any) =>
      Promise.resolve(resolvedValue).then(onFulfilled, onRejected),
  });
  Object.defineProperty(chain, "catch", {
    value: (onRejected: any) => Promise.resolve(resolvedValue).catch(onRejected),
  });
  return chain;
}

export function createMockSupabase() {
  const channelMock = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };

  return {
    from: vi.fn().mockReturnValue(createQueryMock()),
    channel: vi.fn().mockReturnValue(channelMock),
    removeChannel: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  };
}
