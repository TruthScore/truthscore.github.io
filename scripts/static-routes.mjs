// Post-build: give every public route a real HTML file and write sitemap.xml.
//
// GitHub Pages only knows about files, so without this /privacy etc. are served by 404.html
// (HTTP 404) and redirected client-side — browsers cope, but Google sees "Not found" and won't
// index them. Pages serves /privacy from privacy.html with a 200, so we copy the SPA shell to
// <route>.html; react-router then renders the route from the pathname as usual.
//
// Legal pages (/privacy, /terms) are also prerendered with their full text from the SSR bundle
// built by `vite build --ssr scripts/prerender-entry.tsx` (Google OAuth brand verification
// rejects a JS-only privacy policy as having "insufficient content").
//
// Keep ROUTES in sync with the <Route>s in src/App.tsx.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const SITE = "https://truthscore.ai";
const ROUTES = ["/", "/methodology", "/changelog", "/support", "/account/plan", "/account/delete", "/privacy", "/terms"];
const DIST = "dist";

for (const route of ROUTES.filter((r) => r !== "/")) {
  const file = join(DIST, `${route.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  copyFileSync(join(DIST, "index.html"), file);
}

const SSR = join("dist-ssr", "prerender-entry.js");
const { render, PRERENDERED } = await import(pathToFileURL(SSR).href);
const shell = readFileSync(join(DIST, "index.html"), "utf8");
for (const route of PRERENDERED) {
  const { html, title } = render(route);
  if (!html.includes("<h1")) throw new Error(`prerender ${route}: no <h1> in output`);
  const page = shell
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  if (!page.includes(html)) throw new Error(`prerender ${route}: #root placeholder not found in index.html`);
  writeFileSync(join(DIST, `${route.slice(1)}.html`), page);
}
rmSync("dist-ssr", { recursive: true, force: true });

// M#83: Android App Links. Pages must publish these as plain files: the dot directory survives
// only because the Pages artifact keeps it (and .nojekyll stops Jekyll dropping it), so fail the
// build if either is missing or the JSON is broken.
for (const f of [".nojekyll", ".well-known/assetlinks.json", "auth/callback.html"]) {
  try {
    readFileSync(join(DIST, f));
  } catch {
    throw new Error(`static-routes: dist/${f} missing (Android App Links, M#83)`);
  }
}
JSON.parse(readFileSync(join(DIST, ".well-known", "assetlinks.json"), "utf8"));

const urls = ROUTES.map((r) => `  <url><loc>${SITE}${r}</loc></url>`).join("\n");
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
console.log(`static-routes: ${ROUTES.length - 1} route shells (${PRERENDERED.join(", ")} prerendered) + sitemap.xml`);
