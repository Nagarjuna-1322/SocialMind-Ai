# SocialMind AI

> An AI marketing strategist that remembers what works.

SocialMind AI turns historical social-media performance into a repeatable strategy loop for a marketing manager. It combines structured analytics with a server-side Hindsight memory layer so the application can retain post outcomes, recall relevant evidence, and reflect over those memories when recommending the next content plan.

## What is included

- **Dashboard** — KPIs, engagement trend, topic performance, recent learning signals.
- **Content history** — Search/filter the seeded dataset and add a new performance outcome.
- **Analytics** — Topic, format, platform, posting-window, top/bottom post analysis.
- **AI strategy** — Ask “What should we post next week?” and inspect the evidence used.
- **Content generator** — Generate a hook, caption, CTA, hashtags, timing, and brand-fit explanation.
- **AI memory** — Explicit RETAIN → RECALL → REFLECT lifecycle with operation events and source post IDs.
- **Brand profile** — Save audience, voice, goals, platforms, and preferred formats.
- **Settings** — Transparent service status and setup notes.

## Stack

- React 19 + TypeScript + Tailwind CSS
- Express + tRPC + Drizzle ORM
- Managed MySQL/TiDB persistence through the WebDev full-stack scaffold
- Recharts for analytics
- Official `@vectorize-io/hindsight-client` for Hindsight memory operations
- Manus built-in LLM helper for optional structured generation; deterministic analytics remain available when an LLM is unavailable

## Local development

```bash
pnpm install
pnpm drizzle-kit generate
pnpm dev
```

Open the local preview shown by the dev server. The application loads the supplied sample data into the database on the first dashboard request if the post table is empty. The import action is idempotent and only inserts missing post IDs.

## Hindsight configuration

The browser never receives Hindsight credentials. Configure these server-side environment variables in the project environment:

```text
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your-server-side-key
HINDSIGHT_BANK_ID=socialmind-technova
```

Without these values, the app intentionally shows **Memory service unavailable** and does not claim that memories were stored. Database analytics and local learning traces still work, allowing the UI and demo flow to be reviewed safely.

The app uses the official Hindsight client methods:

- `retain` / `retainBatch` for brand profile, historical posts, and new outcomes.
- `recall` for specific evidence queries.
- `reflect` for strategy synthesis over the memory bank.

## Built-in LLM

The project uses the scaffold’s server-side Manus LLM helper when the built-in Forge environment is available. The LLM output is constrained with JSON schemas. If an LLM call times out or is unavailable, SocialMind returns a clearly labeled deterministic recommendation based on stored analytics instead of inventing data.

## Demo script

1. Open **Dashboard** and point out the 80 seeded posts, average engagement, topic ranking, and the memory status banner.
2. Open **AI strategy** and ask: **What should we post next week?**
3. Show the recommendation, confidence level, and **Why this recommendation?** evidence panel.
4. Open **AI memory** and show the explicit RETAIN / RECALL / REFLECT lifecycle plus operation trace.
5. Open **Content history → Add outcome**, save a new high-performing practical AI tutorial, and show the new record and retain status.
6. Ask the strategy question again. With Hindsight configured, the new retained outcome can appear in subsequent recall/reflect evidence.
7. Open **Brand profile** to show that tone and audience preferences are durable context, not prompt-only decoration.

## API

The frontend uses typed tRPC procedures under `/api/trpc`. The application also exposes REST endpoints for integration and demo inspection. See [API.md](docs/API.md).

## Architecture and memory flow

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data flow and [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for a concise presentation script.

## Troubleshooting

- **Memory service unavailable** — confirm `HINDSIGHT_BASE_URL` and `HINDSIGHT_API_KEY` are set on the server, then refresh the app. The UI will remain honest until a real Hindsight call succeeds.
- **No posts** — use **Load sample data**. The action is safe to repeat because `postId` is unique.
- **Duplicate post** — choose a new post ID; duplicates are rejected by the database.
- **Strategy timeout** — retry. Hindsight reflect and LLM calls are bounded; fallback analytics are still returned if the LLM is unavailable.
- **Invalid metrics** — the post form validates non-negative numeric fields; engagement rate is calculated from reach, likes, comments, and shares.
- **Build diagnostics** — run `pnpm check`, `pnpm test`, and `pnpm build`.
