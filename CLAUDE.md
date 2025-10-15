# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.4.6 application configured for deployment on Cloudflare Workers using the OpenNext Cloudflare adapter. The project uses React 19, TypeScript, Tailwind CSS 4, and pnpm as the package manager.

## Development Commands

### Local Development
```bash
pnpm dev          # Start dev server with Turbopack (runs on http://localhost:3000)
pnpm dev:clean    # Kill stuck dev servers and start fresh
pnpm cleanup      # Kill all Next.js dev server processes (useful for port conflicts)
pnpm build        # Build production bundle
pnpm start        # Start production server locally
pnpm lint         # Run ESLint
```

**Troubleshooting Port Conflicts:**
If you encounter `EADDRINUSE` errors (port already in use), run:
```bash
pnpm cleanup      # Kills all Next.js processes
pnpm dev          # Start dev server
```
Or use the combined command:
```bash
pnpm dev:clean    # Cleanup + start in one command
```

### Cloudflare Deployment
```bash
pnpm deploy       # Build and deploy to Cloudflare Workers
pnpm preview      # Build and preview deployment locally
pnpm cf-typegen   # Generate Cloudflare environment types
```

### API Type Generation
```bash
pnpm api:generate # Generate TypeScript types from OpenAPI spec (swagger/yumemi.json)
```

## Environment Variables

### Local Development

1. Copy `.dev.vars.example` to `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. Set your API key in `.dev.vars`:
   ```
   YUMEMI_API_KEY=your_api_key_here
   ```

3. Generate TypeScript types for Cloudflare environment variables:
   ```bash
   pnpm cf-typegen
   ```
   This creates/updates `cloudflare-env.d.ts` with typed `CloudflareEnv` interface.

### Production Deployment

Set secrets in Cloudflare Workers:

```bash
wrangler secret put YUMEMI_API_KEY
# Enter your API key when prompted
```

**Security Note**: This project uses `wrangler secret` to keep API keys out of the bundle. The key is accessed at runtime via `getCloudflareContext().env.YUMEMI_API_KEY`, ensuring it's never embedded in the deployed code.

## Architecture

### Deployment Platform
- **Target**: Cloudflare Workers (not traditional Node.js)
- **Adapter**: `@opennextjs/cloudflare` transforms Next.js for Workers runtime
- **Static Assets**: Served from `.open-next/assets` via Cloudflare Assets binding
- **Worker Entry**: `.open-next/worker.js` (generated during build)

### Key Configuration Files
- `wrangler.jsonc`: Cloudflare Workers configuration with nodejs_compat flag
- `open-next.config.ts`: OpenNext Cloudflare adapter settings (incremental cache can be configured for R2)
- `next.config.ts`: Includes `initOpenNextCloudflareForDev()` to enable `getCloudflareContext()` in dev mode

### TypeScript Configuration
- Path alias: `@/*` maps to `./src/*`
- Cloudflare types: Auto-generated in `cloudflare-env.d.ts` via `wrangler types`
- Strict mode enabled

### Project Structure
- `src/app/`: Next.js App Router pages and layouts
  - Uses App Router (not Pages Router)
  - `actions.ts`: Server Actions for client-server communication
  - Geist and Geist Mono fonts loaded via `next/font/google`
- `src/components/`: React components
  - `PopulationChart.tsx`: Client Component for population visualization
- `src/lib/`: Utility functions and API clients
  - `api-client.ts`: openapi-fetch client (headers injected per-request)
  - `yumemi-api.ts`: Helper functions for Yumemi API calls
- `src/types/`: TypeScript type definitions
  - `population.ts`: Population data types and utilities
- `src/generated/`: Auto-generated files (from OpenAPI specs)
  - `api.ts`: TypeScript types generated from `swagger/yumemi.json`
- `swagger/`: OpenAPI specifications
  - `yumemi.json`: Yumemi API spec (RESAS population data)
- `public/`: Static assets (favicon.ico, SVG icons)
- `.open-next/`: Build output for Cloudflare (generated, git-ignored)

## API Usage

### Yumemi API (RESAS Population Data)

The project uses type-safe API client based on OpenAPI specification.

#### Server Components

```tsx
import { getPrefectures, getPopulationComposition } from "@/lib/yumemi-api";

export default async function Page() {
  const prefectures = await getPrefectures();
  const hokkaido = await getPopulationComposition(1);

  return (
    <div>
      {prefectures.map(pref => (
        <div key={pref.prefCode}>{pref.prefName}</div>
      ))}
    </div>
  );
}
```

#### Server Actions

```tsx
// src/app/actions.ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { client } from "@/lib/api-client";

export async function fetchData() {
  const { env } = await getCloudflareContext();

  const { data, error } = await client.GET("/api/v1/prefectures", {
    headers: {
      "X-API-KEY": env.YUMEMI_API_KEY,
    },
  });

  return data?.result;
}
```

#### Direct API Client Usage

```tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { client } from "@/lib/api-client";

const { env } = await getCloudflareContext();
const { data, error } = await client.GET("/api/v1/prefectures", {
  headers: {
    "X-API-KEY": env.YUMEMI_API_KEY,
  },
});
```

**Important**: API key is injected per-request via `getCloudflareContext().env.YUMEMI_API_KEY` for security.

**Regenerating Types**: Run `pnpm api:generate` after updating `swagger/yumemi.json`

## Important Notes

### Cloudflare Workers Runtime
- Node.js APIs require `nodejs_compat` compatibility flag (already enabled)
- Some Node.js features may not be available even with the compat flag
- Use `getCloudflareContext()` to access Cloudflare-specific APIs (env, bindings, cf object)

### Caching
- By default, uses in-memory incremental cache
- For persistent caching, configure R2 cache in `open-next.config.ts` (currently commented out)
