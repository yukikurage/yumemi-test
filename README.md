# Populations / JP

日本の都道府県別人口データを可視化するWebアプリケーション。

株式会社ゆめみさんのフロントエンドエンジニアコーディング試験です。

リンク : https://yumemi.notion.site/0e9ef27b55704d7882aab55cc86c999d

## Tech Stack

- **Framework**: Next.js 15.4.6 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Deployment**: Cloudflare Workers (via OpenNext Cloudflare adapter)
- **Package Manager**: pnpm
- **Type Generation**: openapi-typescript

## Getting Started

### Prerequisites

- pnpm
- YUMEMI API key ([ゆめみフロントエンドコーディング試験 API](https://yumemi-frontend-engineer-codecheck-api.vercel.app/api-doc))

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd yumemi-test
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and add your YUMEMI API key:

```
YUMEMI_API_KEY=your_api_key_here
```

4. Generate Cloudflare types:

```bash
pnpm cf-typegen
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

Build for production:

```bash
pnpm build
```

Preview production build locally:

```bash
pnpm start
```

## Deployment

### Cloudflare Workers

1. Login to Cloudflare:

```bash
npx wrangler login
```

2. Set your API key as a secret:

```bash
npx wrangler secret put YUMEMI_API_KEY
```

3. Deploy:

```bash
pnpm run deploy
```

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── actions.ts        # Server Actions
│   ├── layout.tsx        # Root layout with fonts and metadata
│   └── page.tsx          # Population data page
├── components/           # React components
├── lib/                  # Utilities and API clients
│   ├── api-client.ts     # openapi-fetch client
│   └── yumemi-api.ts     # RESAS API helpers
├── types/                # TypeScript types
│   └── population.ts     # Population data types
└── generated/            # Auto-generated files
　   └── api.ts            # API types from OpenAPI spec
workers/
└── cache-warmer/         # Cache warming worker
```

## Scripts

```bash
pnpm dev          # Start development server
pnpm dev:clean    # Clean and start dev server
pnpm cleanup      # Kill stuck Next.js processes
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm deploy       # Deploy to Cloudflare Workers
pnpm preview      # Preview deployment locally
pnpm cf-typegen   # Generate Cloudflare env types
pnpm api:generate # Generate API types from OpenAPI spec
```

## API Type Generation

API types are automatically generated from the OpenAPI specification in `swagger/yumemi.json`:

```bash
pnpm api:generate
```

This updates `src/generated/api.ts` with type-safe API client types.

## Environment Variables

### Development (`.dev.vars`)

```
YUMEMI_API_KEY=your_resas_api_key
```

### Production (Cloudflare Workers)

Set secrets using Wrangler:

```bash
wrangler secret put YUMEMI_API_KEY
```

## Architecture

This application uses **OpenNext Cloudflare adapter** to deploy Next.js on Cloudflare Workers:

- Static assets are served from Cloudflare Assets
- API routes and server components run on Workers
- Environment variables are accessed via `getCloudflareContext()`
- Incremental cache uses in-memory storage (configurable for R2)

See `CLAUDE.md` for detailed architecture documentation.

## License

MIT

## Acknowledgments

- Population data provided by [ゆめみフロントエンドコーディング試験 API](https://yumemi-frontend-engineer-codecheck-api.vercel.app/api-doc) from RESAS
- Built with [Next.js](https://nextjs.org/)
- Deployed on [Cloudflare Workers](https://workers.cloudflare.com/)
- Japan's topojson data provided by 地球地図日本 (edited by topojson-simplify)
