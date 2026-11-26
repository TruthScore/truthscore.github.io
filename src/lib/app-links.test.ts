// M#83: Android verifies https://truthscore.ai/.well-known/assetlinks.json before it opens the app
// for https://truthscore.ai/auth/callback. Both files are static, copied from public/ into dist/.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(__dirname, "../../public", p), "utf8");
const SHA256 = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

describe("Android App Links", () => {
  it("assetlinks.json grants com.adaptive.truthscore with well-formed SHA-256 fingerprints", () => {
    const links = JSON.parse(read(".well-known/assetlinks.json"));
    expect(links).toHaveLength(1);
    const [link] = links;
    // handle_all_urls is required for App Links; get_login_creds (Play Console's file) is allowed.
    expect(link.relation).toContain("delegate_permission/common.handle_all_urls");
    for (const r of link.relation)
      expect([
        "delegate_permission/common.handle_all_urls",
        "delegate_permission/common.get_login_creds",
      ]).toContain(r);
    expect(link.target.namespace).toBe("android_app");
    expect(link.target.package_name).toBe("com.adaptive.truthscore");
    const fps: string[] = link.target.sha256_cert_fingerprints;
    // Play app signing key: Play re-signs the release build with it (M#83).
    expect(fps).toContain(
      "EE:F5:74:76:CF:AE:26:42:00:DD:69:13:A1:2C:05:16:7C:60:73:AE:8A:FF:0B:A8:59:ED:02:B3:AE:0A:5F:CD",
    );
    // Upload certificate (mobile docs/android-release.md → Signing).
    expect(fps).toContain(
      "36:D8:B0:02:D5:67:44:90:72:02:B8:3A:AE:91:C1:E5:0E:5E:39:1A:55:3A:84:0A:13:DF:73:7E:16:EC:21:DB",
    );
    for (const fp of fps) expect(fp).toMatch(SHA256);
    expect(new Set(fps).size).toBe(fps.length);
  });

  it("auth/callback.html hands the code to the app by package name", () => {
    const html = read("auth/callback.html");
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain('<meta name="referrer" content="no-referrer">');
    expect(html).toContain("#Intent;scheme=ai.truthscore.app;package=com.adaptive.truthscore;end");
    expect(html).toContain("'ai.truthscore.app://auth-callback' + q");
  });
});
