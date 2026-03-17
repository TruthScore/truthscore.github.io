# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (bun.lockb is present; prefer bun over npm)
bun install

# Start dev server (hot reload)
bun run dev

# Production build
bun run build

# Lint
bun run lint

# Preview production build locally
bun run preview
```

## Architecture

This is a **Vite + React + TypeScript** single-page application using **shadcn/ui** components and **Tailwind CSS**. It is a marketing/landing page for TruthScore.ai.

### Routing

- `src/App.tsx` — Root component. Sets up `react-router-dom` routes, wraps with `QueryClientProvider` and `TooltipProvider`. New routes go here, above the `*` catch-all.
- `src/pages/Index.tsx` — The landing page, currently composed of `<Hero />` and `<Features />`.
- `src/pages/NotFound.tsx` — 404 fallback.

### Components

- `src/components/Hero.tsx` — Above-the-fold section with animated hero visual, CTA buttons, and social proof.
- `src/components/Features.tsx` — Features carousel (horizontal scroll/snap), pricing comparison table, and bottom CTA.
- `src/components/ui/` — shadcn/ui primitives (do not edit manually; use the shadcn CLI to add/update components).

### Styling

- **Color scheme**: Slate and orange (`orange-600` as the primary brand color).
- CSS custom properties (HSL) are defined in `src/index.css` under `@layer base`. This is the single source of truth for the design token system — modify colors/radius here, not in `tailwind.config.ts`.
- `tailwind.config.ts` maps those CSS variables to Tailwind color names (`primary`, `accent`, etc.).
- Dark mode is class-based (`darkMode: ["class"]`) but not currently implemented in the UI.

### Path Aliases

`@/` maps to `src/` (configured in `tsconfig.app.json` and Vite).

### Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Components land in `src/components/ui/`.
