# Repository Guidelines

## Project Structure & Module Organization
The Next.js application lives in `src/app`, with routing in `page.tsx` and server helpers in `actions.ts`. UI components sit in `src/components`, while shared data logic and caching belong in `src/lib`. `pnpm api:generate` writes OpenAPI clients to `src/generated/api.ts`. Static assets stay in `public`, API schemas in `swagger`, and the Cloudflare cache-warmer worker in `workers/cache-warmer`. Add new code within these folders so the `@/*` path alias keeps working.

## Build, Test, and Development Commands
- `pnpm dev` starts the Turbopack dev server on localhost:3000.
- `pnpm build` produces the optimized Next.js output; run before `pnpm deploy`.
- `pnpm start` serves the production bundle for smoke checks.
- `pnpm lint` runs the Next.js/ESLint suite and flags type or accessibility issues.
- `pnpm deploy` and `pnpm preview` use `opennextjs-cloudflare` to build and ship to Cloudflare.
- `pnpm cf-typegen` refreshes bindings in `cloudflare-env.d.ts`.
- `pnpm api:generate` syncs the REST client with `swagger/yumemi.json` after spec updates.

## Coding Style & Naming Conventions
Strict TypeScript and the `next/core-web-vitals` ESLint rules are enforced. Use PascalCase for React components, camelCase for helpers, and prefix hooks with `use`. Prefer Tailwind utilities (imported in `globals.css`); only add component-scoped `.css` files when utilities fall short. Keep shared logic pure inside `src/lib` and Cloudflare-specific code in the worker folder. Run `pnpm lint` before raising a pull request to catch import order, JSX accessibility, and type issues.

## Testing Guidelines
Automated tests are not yet in place. When adding them, prefer React Testing Library and store specs in `src/__tests__` or alongside components as `*.test.tsx`. Mock API calls through `src/lib/apiClient.ts` or the generated client to avoid network access. For chart updates, capture screenshots from `pnpm dev` and list manual verification steps in the pull request.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits (`feat:`, `fix:`, `chore:`). Keep commits focused and include regenerated files (such as `src/generated/api.ts`) with their source changes. Pull requests should provide a concise summary, link issues, share lint or test output, and attach UI screenshots when visuals change. Flag Cloudflare configuration impacts and note if reviewers need to rerun `pnpm api:generate` or `pnpm cf-typegen` after merging.
