import { describe, expect, it, vi } from "vitest";
import { pollForPaidPlan, readCheckoutReturn } from "./checkout-return";
import type { EngineResult, Profile } from "./engine";

const profile = (plan: Profile["plan"]): EngineResult<Profile> => ({
  ok: true,
  data: { id: "u1", email: null, display_name: null, plan },
});
const noSleep = () => Promise.resolve();

describe("readCheckoutReturn", () => {
  it.each([
    ["?checkout=success", "success"],
    ["?checkout=cancel", "cancel"],
    ["?checkout=other", null],
    ["", null],
  ])("%s -> %s", (search, expected) => {
    expect(readCheckoutReturn(search)).toBe(expected);
  });
});

describe("pollForPaidPlan", () => {
  it("stops as soon as the webhook has landed", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(profile("free"))
      .mockResolvedValueOnce(profile("free"))
      .mockResolvedValueOnce(profile("dedicated"));
    const r = await pollForPaidPlan(fetch, { sleep: noSleep });
    expect(r.paid).toBe(true);
    expect(r.profile?.plan).toBe("dedicated");
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("gives up after the set attempts and reports not paid", async () => {
    const fetch = vi.fn().mockResolvedValue(profile("free"));
    const sleep = vi.fn(noSleep);
    const r = await pollForPaidPlan(fetch, { attempts: 4, intervalMs: 50, sleep });
    expect(r.paid).toBe(false);
    expect(r.profile?.plan).toBe("free");
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(sleep).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledWith(50);
  });

  it("rides through failed fetches", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, error: { status: 0, code: "NETWORK_ERROR", message: "x" } })
      .mockResolvedValueOnce(profile("dedicated"));
    expect((await pollForPaidPlan(fetch, { sleep: noSleep })).paid).toBe(true);
  });

  it("stops when cancelled", async () => {
    const fetch = vi.fn().mockResolvedValue(profile("free"));
    let n = 0;
    await pollForPaidPlan(fetch, { sleep: noSleep, isCancelled: () => ++n > 2 });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
