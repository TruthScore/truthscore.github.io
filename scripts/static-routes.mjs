// Post-build: give every public route a real HTML file and write sitemap.xml.
//
// GitHub Pages only knows about files, so without this /privacy etc. are served by 404.html
// (HTTP 404) and redirected client-side — browsers cope, but Google sees "Not found" and won't
// index them. Pages serves /privacy from privacy.html with a 200, so we copy the SPA shell to
// <route>.html; react-router then renders the route from the pathname as usual.
//
// Keep ROUTES in sync with the <Route>s in src/App.tsx.
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const SITE = "https://truthscore.ai";
const ROUTES = ["/", "/methodology", "/changelog", "/support", "/account/plan", "/privacy", "/terms"];
const DIST = "dist";

for (const route of ROUTES.filter((r) => r !== "/")) {
  const file = join(DIST, `${route.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  copyFileSync(join(DIST, "index.html"), file);
}

const urls = ROUTES.map((r) => `  <url><loc>${SITE}${r}</loc></url>`).join("\n");
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
console.log(`static-routes: ${ROUTES.length - 1} route shells + sitemap.xml`);
