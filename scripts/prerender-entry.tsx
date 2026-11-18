// SSR entry for scripts/static-routes.mjs: renders the legal pages to static HTML at build
// time so crawlers that don't run JavaScript (Google OAuth brand verification, search) see the
// full text. The client still mounts with createRoot, which replaces this markup.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

const PAGES: Record<string, { title: string; Page: () => JSX.Element }> = {
  "/privacy": { title: "Privacy Policy — TruthScore.ai", Page: Privacy },
  "/terms": { title: "Terms of Service — TruthScore.ai", Page: Terms },
};

export const PRERENDERED = Object.keys(PAGES);

export function render(route: string): { html: string; title: string } {
  const { title, Page } = PAGES[route];
  const html = renderToString(
    <StaticRouter location={route}>
      <Page />
    </StaticRouter>,
  );
  return { html, title };
}
