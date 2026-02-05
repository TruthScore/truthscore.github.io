# CLAUDE.md

## Project Overview

TruthScore.ai landing page — a React SPA for an AI-powered news credibility scoring platform ("the nutrition label for news"). Built with Vite, React 18, TypeScript, Tailwind CSS, and shadcn/ui.

## Commands

```bash
npm run dev        # Start dev server (port 8080)
npm run build      # Production build
npm run build:dev  # Development mode build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

No test framework is configured.

## Architecture

- **Pages**: `src/pages/` — Index.tsx (landing page composed of Hero + Features), NotFound.tsx
- **Components**: `src/components/` — Hero.tsx, Features.tsx; `src/components/ui/` holds 40+ shadcn/ui components
- **Hooks**: `src/hooks/` — use-mobile.tsx, use-toast.ts
- **Utilities**: `src/lib/utils.ts` — `cn()` class name merger
- **Routing**: React Router v6 in `src/App.tsx` — single `/` route + catch-all 404
- **State**: TanStack React Query for server state; React Hook Form + Zod for forms
- **Styling**: Tailwind CSS with HSL CSS variables defined in `src/index.css`; dark mode via class strategy

## Conventions

- Import alias: `@/` maps to `src/`
- Component naming: PascalCase files and exports
- TypeScript config is loose (noImplicitAny: false, strictNullChecks: false)
- shadcn/ui components are local copies in `src/components/ui/`, not an npm package
- Brand color: sunset orange (`--primary` in index.css)
