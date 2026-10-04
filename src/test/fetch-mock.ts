import { vi } from "vitest";

export type Reply = { status: number; body?: unknown } | Error;
type Handler = (url: string, init: RequestInit) => Reply;

/** Stub global fetch with a router keyed on "METHOD path-suffix"; records every call. */
export function mockFetch(routes: Record<string, Reply | Reply[] | Handler>) {
  const calls: { method: string; url: string; init: RequestInit }[] = [];
  const queues = new Map<string, Reply[]>();
  const fn = vi.fn(async (url: string, init: RequestInit = {}) => {
    const method = (init.method || "GET").toUpperCase();
    calls.push({ method, url, init });
    const key = Object.keys(routes).find((k) => {
      const [m, p] = k.split(" ");
      return m === method && url.split("?")[0].endsWith(p);
    });
    if (!key) throw new Error(`unmocked fetch: ${method} ${url}`);
    let route = routes[key];
    if (Array.isArray(route)) {
      if (!queues.has(key)) queues.set(key, [...route]);
      const q = queues.get(key)!;
      route = q.length > 1 ? q.shift()! : q[0];
    }
    const reply = typeof route === "function" ? route(url, init) : route;
    if (reply instanceof Error) throw reply;
    return new Response(reply.body === undefined ? null : JSON.stringify(reply.body), {
      status: reply.status,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fn);
  return { fn, calls };
}

export const future = () => Math.floor(Date.now() / 1000) + 3600;
