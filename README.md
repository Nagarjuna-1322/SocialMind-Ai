
## Deploying to Vercel

The existing Express backend now has a Vercel-compatible entrypoint at `api/index.ts`, while the existing Vite frontend is emitted to `dist/public`. `vercel.json` keeps the current build command and serves the SPA output without changing the local development server.

1. Install the project dependencies with `pnpm install`.
2. Authenticate with Vercel using `pnpm vercel login` or `vercel login`.
3. Link the project with `pnpm exec vercel link`.
4. Add the server-side environment variables in Vercel Project Settings: `DATABASE_URL`, `JWT_SECRET`, the existing Manus Forge variables, `HINDSIGHT_BASE_URL`, `HINDSIGHT_API_KEY`, and `HINDSIGHT_BANK_ID`.
5. Preview locally with `pnpm vercel:dev`, validate the deployment planner with `pnpm vercel:build`, and deploy with `pnpm vercel:deploy`.

Hindsight and LLM credentials are never placed in the React bundle; they are read only by the serverless Express function.
