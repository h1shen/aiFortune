# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

**aiFortune** (玄机阁) — marketing landing page for an AI-driven Chinese Bazi (八字) fortune-reading product. All user-facing copy is Simplified Chinese. Bootstrapped from v0.app (see `generator` field in `app/layout.tsx`).

The app is presentational: `app/page.tsx` composes a vertical stack of section components. There is no backend, no API routes, and no tests. `components/bazi-form.tsx` is a UI-only stub — its submit handler just `console.log`s, nothing is wired to a backend yet.

## Commands

Package manager is **pnpm** (lockfile present).

```bash
pnpm dev          # next dev — local server
pnpm build        # next build
pnpm start        # next start (after build)
pnpm lint         # eslint .
```

No test runner is configured.

**Type-checking gotcha:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` will NOT fail on TS errors. To actually type-check, run `pnpm exec tsc --noEmit`.

## Architecture

- **Next.js 16 App Router + React 19 + TypeScript**. Single route (`app/page.tsx`), which imports ~8 section components from `components/*.tsx`. Root layout (`app/layout.tsx`) wires fonts (Inter + Noto Serif SC) and Vercel Analytics (production only).
- **Import alias:** `@/*` → repo root (`tsconfig.json`). E.g. `@/components/ui/button`, `@/lib/utils`.
- **UI primitives:** shadcn/ui, `new-york` style, neutral base, CSS variables, lucide icons. All ~50 primitives are already generated under `components/ui/`. Reuse them — don't reinstall. `components.json` holds the shadcn config.
- **Styling:** Tailwind CSS **v4** via `@tailwindcss/postcss` (no `tailwind.config.*` file — config lives inline in `app/globals.css` under `@theme inline`). `tw-animate-css` provides animations. Class merging helper: `cn()` from `@/lib/utils`.
- **Design system** (in `app/globals.css`): Chinese literati palette expressed as oklch tokens — 宣纸 (rice-paper background), 墨 (ink primary), 烫金 (gilt accent), 朱砂红 (cinnabar destructive). Dark mode via `.dark` class, driven by `next-themes` (`components/theme-provider.tsx`). Custom utilities: `.paper-texture`, `.ink-divider`, `.font-serif` (for Chinese headings — apply to any Chinese display text).
- **Duplicate globals.css:** there is also `styles/globals.css` that is **not imported anywhere**. Edit `app/globals.css`; ignore `styles/`.
- **Hooks:** only `hooks/use-mobile.ts` and `hooks/use-toast.ts` (plus copies inside `components/ui/`).

## Conventions

- Components that use hooks/state must start with `"use client"` (see `components/bazi-form.tsx`).
- Use `font-serif` utility for Chinese display typography; sans (Inter) is the default body font.
- Keep new copy in Simplified Chinese to match the existing tone.
