import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";

// The ?p= restore script that 404.html hands off to, run as it is in index.html.
const html = readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");
const restore = html.match(/<script>\s*(\/\/ SPA routing[\s\S]*?)<\/script>/)![1];
const run = (url: string) => {
  window.history.replaceState(null, "", url);
  new Function(restore)();
  return window.location.pathname + window.location.search + window.location.hash;
};

describe("index.html ?p= restore", () => {
  beforeEach(() => window.history.replaceState(null, "", "/"));

  it("restores a same-site path and fragment", () => {
    expect(run("/?p=%2Faccount%2Fplan%3Fcheckout%3Dcancel&h=top")).toBe("/account/plan?checkout=cancel#top");
  });

  it.each(["//evil.example/x", "/\\evil.example", "https://evil.example/", "javascript:alert(1)", "account"])(
    "ignores %s",
    (p) => {
      const url = `/?p=${encodeURIComponent(p)}`;
      expect(() => run(url)).not.toThrow();
      expect(window.location.pathname).toBe("/");
    },
  );
});
