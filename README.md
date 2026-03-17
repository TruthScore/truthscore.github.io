# TruthScore.ai — Website

Marketing and landing page for [TruthScore.ai](https://truthscore.ai) — the credibility scoring tool for news articles, available as a Chrome Extension and iOS App.

## About TruthScore

TruthScore gives every news article a credibility score — built by AI, refined by community, readable in seconds. Think of it as a nutrition label for news: transparent, unbiased, and always available where you read.

- **Chrome Extension** — overlays credibility scores directly on articles as you browse
- **iOS App** — brings the same scoring to mobile Safari and your news reader
- **AI Engine** — analyses source reputation, factual consistency, and linguistic signals; improved continuously by Expert-tier community feedback

## Plans

| | Free | Dedicated ($3/mo) | Expert ($5/mo) |
|---|---|---|---|
| Rated articles | 100/mo | 1,000/mo | Unlimited |
| Article history | 7 days | 30 days | 1 year |
| Advanced trends | — | ✓ | ✓ |
| Community feedback | — | — | ✓ |

## This repository

This repo contains the public-facing website: landing page, pricing, and changelog.

**Stack:** Vite · React · TypeScript · Tailwind CSS · shadcn/ui
**Fonts:** Space Grotesk · JetBrains Mono
**Deployed to:** GitHub Pages via GitHub Actions

### Local development

Requires [Bun](https://bun.sh).

```bash
bun install       # install dependencies
bun run dev       # start dev server at localhost:8080
bun run build     # production build → dist/
bun run preview   # preview production build locally
bun run lint      # lint
```

### Deployment

Pushes to `main` automatically deploy to GitHub Pages via `.github/workflows/deploy.yml`.

To enable: go to **Settings → Pages** in the GitHub repo and set the source to **GitHub Actions**.

## Contributing

Issues and pull requests are welcome. Please open an issue before starting significant work so we can discuss the approach.

## License

© TruthScore.ai. All rights reserved.
