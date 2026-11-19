import { describe, expect, it } from "vitest";
import { AUTH_ERROR_FALLBACK, readAuthError } from "./auth-errors";

describe("readAuthError", () => {
  it("returns null without an error", () => {
    expect(readAuthError("?code=abc", "")).toBeNull();
  });

  it("maps a known error to fixed copy and ignores error_description", () => {
    const msg = readAuthError("?error=access_denied&error_description=Go+to+evil.example", "");
    expect(msg).toBe("Sign-in was cancelled. You can try again below.");
  });

  it("prefers a known error_code, read from the fragment too", () => {
    expect(readAuthError("", "#error=invalid_request&error_code=flow_state_expired")).toMatch(/expired/);
  });

  it("falls back to generic copy for unknown or odd values", () => {
    expect(readAuthError("?error=<b>hi</b>", "")).toBe(AUTH_ERROR_FALLBACK);
    expect(readAuthError("?error=__proto__&error_code=constructor", "")).toBe(AUTH_ERROR_FALLBACK);
  });
});
