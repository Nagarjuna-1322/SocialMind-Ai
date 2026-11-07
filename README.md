[README (1).md](https://github.com/user-attachments/files/34488467/README.1.md)
<div align="center">

# SocialMind AI 🧠

### Turn every post into a smarter next move.

**An AI-powered social media intelligence workspace that combines content analytics, brand context, and long-term memory to support better content decisions.**

[Purpose](#-what-socialmind-ai-is-used-for) · [Using the app](#-how-to-use-the-application) · [How it works](#-how-the-application-works) · [Architecture](#-application-architecture) · [Setup](#-getting-started) · [API](#-api-overview)

</div>

---

## 🌟 Overview

Most social media tools show what happened. **SocialMind AI** is designed to help you decide **what to publish next—and why**.

SocialMind tracks historical post performance, identifies stronger topics and formats, and uses that evidence to recommend future content. When connected to **Hindsight**, the application can retain content outcomes and brand preferences, recall relevant experiences, and reflect on those memories when answering strategy questions.

The repository includes a **TechNova** sample marketing workspace and demo dataset so you can explore the experience without connecting a social account. Real AI and external-memory capabilities depend on configuring their respective services.

## ✨ Features

| Feature | What it does |
| --- | --- |
| 📊 **Analytics dashboard** | Summarizes reach, engagement, and historical performance with visual charts. |
| 🗂️ **Content history** | Browse and filter posts by platform, topic, and content type; add new outcomes manually. |
| 🎯 **AI strategy** | Suggests topics, formats, posting windows, content ideas, and patterns to avoid, using available evidence. |
| ✍️ **Content generator** | Produces a suggested hook, caption, CTA, hashtags, timing, and rationale from a content brief. |
| 🧠 **Memory-backed recommendations** | Uses Hindsight's **RETAIN → RECALL → REFLECT** lifecycle to learn from post outcomes and brand context when the service is connected. |
| 🏷️ **Brand profile** | Stores brand identity, audience, tone, goals, platforms, and preferred content formats. |
| 📷 **Instagram connection** | Supports Meta Instagram Login for a professional account and imports recent media into analytics when configured. |
| 🔐 **User authentication** | Supabase email/password sign-in, sign-up, recovery, and OAuth options for Google and GitHub when configured. |
| 🧪 **Sample dataset** | Loads sample posts and a TechNova brand profile for exploration and demonstrations. |

> **Important:** This is a working application with optional integrations, not a promise that every external connection is active. Without Hindsight or an LLM provider, the server returns explicit integration status and uses available analytics-based fallbacks rather than pretending a service ran successfully.

## 🎯 What SocialMind AI is used for

**SocialMind AI is a social media analytics and content-strategy application for creators, marketers, small businesses, and brand teams.** It helps answer a practical question: *“Based on our previous posts and our audience's response, what should we publish next?”*

A typical social media workflow involves checking platform statistics, comparing posts manually, remembering what worked, and brainstorming ideas. SocialMind brings those steps together in one workspace:

| The user's need | How SocialMind helps |
| --- | --- |
| **Know what content performs best** | Compares stored post reach, engagement, topics, formats, and posting times. |
| **Understand past audience behavior** | Stores post outcomes and audience-response notes; optional Hindsight memory connects lessons across interactions. |
| **Decide what to publish next** | Builds an evidence-backed content strategy from the brand profile and available performance data. |
| **Create content faster** | Suggests hooks, captions, calls to action, hashtags, and posting windows. |
| **Keep a consistent brand voice** | Uses the brand's audience, tone, goals, preferred formats, and platforms. |
| **Learn from new results** | Lets the user add a new post result or sync Instagram media, then compare the updated data. |

**The goal is decision support, not automatic publishing.** Users review the suggestions, publish through their chosen social platform, and then bring performance results back into SocialMind. The application is **not** a live social-listening or autonomous posting bot.

## 👩‍💻 How to use the application

The experience follows a simple cycle: **sign in → collect data → analyze → ask AI → create content → track results**.

### Step 1 — Sign in to a workspace

Open SocialMind in your browser, create an account or sign in using the configured **Supabase** authentication flow. Email/password and optional Google/GitHub OAuth are represented in the login UI. Authentication configuration must be provided by the project operator before sign-in works.

### Step 2 — Add a brand and its content history

Open **Brand profile** to define the brand name, industry, target audience, tone, platforms, campaign goals, and preferred formats. Then supply past performance data using one of these paths:

- **Load sample data:** Explore the included **TechNova** demo content without needing a connected social account.
- **Add a post manually:** Enter its platform, topic, format, date, caption, views, reach, likes, comments, shares, posting time, and audience response in **Content history**.
- **Connect Instagram:** In **Settings**, connect an eligible Instagram professional account through Meta and select **Sync posts**. This path needs a configured Meta app and a persistent database.

### Step 3 — Explore dashboard and analytics

Use **Dashboard** and **Analytics** to inspect available post metrics. The application groups past content by topic, content type, and publishing time, identifies stronger and weaker performers, and displays trends using charts and rankings. Engagement rate is calculated as:

```text
Engagement rate (%) = (likes + comments + shares) / reach × 100
```

This formula is used when a rate is not supplied and reach is available. Missing metrics should not be treated as real zeros from the platform; for example, an Instagram import may not provide reach or shares.

### Step 4 — Ask for a content strategy

Open **AI strategy** and ask a question such as:

> What should we post next week to improve engagement with developers?

SocialMind looks at saved posts, your brand profile, and any available Hindsight memories. It returns suggested **topics**, **content formats**, **posting windows**, **content ideas**, **patterns to avoid**, and **supporting evidence**. When Hindsight is connected, source-post IDs and memory status help explain where the suggestions came from.

### Step 5 — Generate a content draft

Open **Content generator**, choose an objective, topic, format, target audience, and tone. The app prepares a **hook, caption, call to action, hashtags, suggested timing, and rationale**. Review and edit the draft before publishing on the actual social platform.

### Step 6 — Feed new results back into the app

After publishing, return to **Content history** and add the post's actual performance, or sync Instagram again. This updates the dataset used for future analysis. With Hindsight configured, SocialMind also attempts to **retain** the new outcome so later strategy questions can **recall** it.

### Example: a real usage scenario

Suppose a technology education brand posts tutorials, carousels, and short videos on Instagram and LinkedIn:

1. The marketer loads previous posts into SocialMind.
2. Analytics indicate that practical AI tutorials engage the audience more effectively than several other categories.
3. The marketer asks, **“What type of content should we publish next week?”**
4. SocialMind recommends promising topics and formats based on the available performance records; if configured, Hindsight contributes learned preferences and past outcomes.
5. The marketer generates a tutorial caption and CTA, reviews them, and publishes the post outside the application.
6. After collecting the results, the marketer adds the new post to SocialMind so future recommendations can incorporate that outcome.

The example illustrates the workflow; **actual recommendations depend on the user's data and connected services**.


### End-to-end processing flow

```mermaid
flowchart TD
    A[User signs in and opens the workspace] --> B[Add posts or sync Instagram]
    B --> C[Store content history and brand profile]
    C --> D[Calculate analytics and compare performance]
    D --> E[User asks a strategy question]
    E --> F[Retrieve brand context and supporting posts]
    F --> G{Hindsight connected?}
    G -- Yes --> H[Recall and reflect on brand memories]
    G -- No --> I[Use available historical analytics]
    H --> J[Assemble evidence and strategy context]
    I --> J
    J --> K{LLM available?}
    K -- Yes --> L[Generate structured AI recommendation]
    K -- No --> M[Generate analytics-based fallback]
    L --> N[Show topics, formats, timing and evidence]
    M --> N
    N --> O[User reviews, publishes externally and records new results]
    O --> C
```

**Why memory matters:** Normal analytics describes past numerical performance. Hindsight can optionally store lessons about the brand and audience and retrieve them in later sessions. SocialMind still distinguishes retrieved memories from ordinary database evidence.

## 🏗️ Application architecture

SocialMind uses a **full-stack, layered architecture**: React handles the user experience, Express/tRPC handles requests, the SocialMind service performs business logic, Drizzle accesses persisted data, and optional third-party services provide AI generation, memory, authentication, and Instagram connectivity.

### System architecture diagram

```mermaid
flowchart TB
    USER[Content creator / marketer] --> WEB[React + TypeScript frontend]
    WEB --> AUTH[Supabase Auth: user login]
    WEB --> API[Express backend: tRPC + REST API]

    API --> CORE[SocialMind service: analytics, strategy and content generation]
    API --> IG[Instagram OAuth and sync module]
    IG <--> META[Meta Instagram API]

    CORE <--> DB[(MySQL-compatible database via Drizzle)]
    IG --> DB
    CORE --> CALC[Performance analysis and rankings]
    CORE <-.-> MEMORY[Hindsight memory service: retain / recall / reflect]
    CORE <-.-> LLM[Server-side LLM service]
    CALC --> CORE

    API --> WEB
    WEB --> USER
```

**What each component does**

| Architecture layer | Responsibility | Relevant source |
| --- | --- | --- |
| **Client / presentation** | Login screens, dashboard, content history, charts, strategy and generator forms, brand settings. | [`client/src/`](client/src/) |
| **Authentication** | Supabase login/session flow and server-side claim/profile support. | [`client/src/contexts/SupabaseAuthContext.tsx`](client/src/contexts/SupabaseAuthContext.tsx), [`server/supabase-auth.ts`](server/supabase-auth.ts) |
| **API / controller** | Receives typed tRPC requests and REST requests, validates inputs, and coordinates operations. | [`server/routers.ts`](server/routers.ts), [`server/app.ts`](server/app.ts) |
| **Application services** | Calculates social performance, creates strategies, manages brand profiles and post outcomes, and calls optional AI services. | [`server/socialmind.ts`](server/socialmind.ts) |
| **Database / persistence** | Stores brands, posts, users, workspaces, connection metadata and memory operation events. | [`server/db.ts`](server/db.ts), [`drizzle/schema.ts`](drizzle/schema.ts) |
| **Long-term memory (optional)** | Retains, recalls, and reflects on previously recorded brand preferences and content results. | [`server/socialmind.ts`](server/socialmind.ts), Hindsight SDK |
| **LLM (optional)** | Generates structured strategies and content suggestions from evidence; never directly receives private API keys in the browser. | [`server/_core/llm.ts`](server/_core/llm.ts) |
| **Instagram integration (optional)** | Handles Meta OAuth, encrypted token storage, and media synchronization. | [`server/instagram.ts`](server/instagram.ts) |
| **Hosting** | Local Express/Vite server and project configuration for a Vercel build/API entrypoint. | [`server/_core/index.ts`](server/_core/index.ts), [`api/index.ts`](api/index.ts), [`vercel.json`](vercel.json) |

### Example API request: asking for an AI strategy

```mermaid
sequenceDiagram
    actor User
    participant UI as React dashboard
    participant API as Express / tRPC
    participant Service as SocialMind service
    participant DB as Database
    participant Memory as Hindsight (optional)
    participant LLM as LLM provider (optional)

    User->>UI: Ask "What should we post next week?"
    UI->>API: socialmind.strategy(question)
    API->>Service: runStrategy(question)
    Service->>DB: Load brand profile and historical posts
    DB-->>Service: Brand context and post metrics
    Service->>Service: Calculate analytics and evidence
    opt Hindsight connected
        Service->>Memory: Recall relevant content memories
        Memory-->>Service: Past outcomes and source post IDs
        Service->>Memory: Reflect on strategy question
        Memory-->>Service: Learned observations
    end
    opt LLM configured and available
        Service->>LLM: Brand + analytics + evidence
        LLM-->>Service: Structured recommendations
    end
    Service->>Service: Use analytical fallback if LLM unavailable
    Service-->>API: Strategy, evidence, confidence, status
    API-->>UI: Typed response
    UI-->>User: Topics, formats, times and explanations
```

### Key architectural decisions

- **Single application, separate responsibilities:** React only renders the workspace; the Express server handles integrations and core logic.
- **Business logic stays on the backend:** Analytics, memory orchestration, and generation are implemented in the SocialMind service rather than in the browser.
- **Evidence over invented metrics:** Recommendations derive from stored posts and available memory evidence, and missing third-party insights are not fabricated.
- **Graceful fallback:** Missing Hindsight or LLM connectivity does not automatically block the demo analytics workflow, but the response and UI must reflect that limitation.
- **External secrets remain server-side:** Hindsight credentials, AI-provider keys, and Instagram app secrets are environment variables on the server.
- **Production hardening is still required:** Client-side route protection does not automatically protect REST endpoints; implement and verify authentication, authorization, tenant isolation, and rate limits before exposing real customer data.

### Repository layout

```text
SocialMind-Ai/
├── api/                  # Vercel API entrypoint
├── client/
│   └── src/
│       ├── pages/        # Dashboard, login, verification, reset flows
│       ├── components/   # UI components and reusable views
│       ├── contexts/     # Authentication and theme providers
│       └── lib/          # Supabase and tRPC clients
├── server/
│   ├── _core/            # Express setup, LLM, OAuth, other services
│   ├── app.ts            # REST routes and tRPC app setup
│   ├── socialmind.ts     # Brand, analytics, strategy, memory, content
│   ├── instagram.ts      # Instagram connection and media import
│   └── data/             # TechNova sample brand and post data
├── drizzle/              # Schema and database migrations
├── shared/               # Shared types and constants
├── docs/                 # Integration and architecture notes
├── package.json
├── vercel.json
└── vite.config.ts
```

## 🛠️ Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| UI and visualization | Radix UI, Lucide React, Recharts, Framer Motion |
| Backend | Node.js, Express, tRPC, Zod |
| Database and ORM | MySQL-compatible database, Drizzle ORM, Drizzle Kit |
| Authentication | Supabase Auth |
| AI generation | Server-side LLM integration through a configured Forge-compatible endpoint |
| Long-term memory | Hindsight (`@vectorize-io/hindsight-client`) |
| Social platform integration | Meta Instagram Login / Instagram API |
| Testing and tooling | Vitest, TypeScript, Prettier, pnpm |
| Deployment configuration | Vercel (`vercel.json`, `api/index.ts`) |

## 🚀 Getting started

### Prerequisites

- **Node.js** compatible with this repository's Vite 7 toolchain (Node.js 20.19+ or 22.12+).
- **pnpm** (the repository declares pnpm 10.4.1); [Corepack](https://nodejs.org/api/corepack.html) is a convenient way to manage it.
- A **Supabase project** for authentication.
- A **MySQL-compatible database** for persistent application data and Instagram connections (recommended).
- Optional: Hindsight credentials, an LLM service, and a Meta developer app for their respective features.

### 1. Clone the repository

```bash
git clone https://github.com/Nagarjuna-1322/SocialMind-Ai.git
cd SocialMind-Ai
```

### 2. Install dependencies

```bash
corepack enable
pnpm install --frozen-lockfile
```

### 3. Configure your environment

Create a **`.env` file in the project root**. There is no committed `.env.example` in this repository; use the following as a starting template and replace placeholders with your own values.

```dotenv
# Authentication
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY

# Persistent data (recommended)
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE

# Server secret (also used for Instagram token encryption)
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET

# Optional: Hindsight memory
HINDSIGHT_BASE_URL=https://YOUR_HINDSIGHT_SERVER
HINDSIGHT_API_KEY=YOUR_HINDSIGHT_API_KEY
HINDSIGHT_BANK_ID=socialmind-technova

# Optional: server-side AI generation
BUILT_IN_FORGE_API_URL=https://YOUR_COMPATIBLE_API_BASE
BUILT_IN_FORGE_API_KEY=YOUR_API_KEY

# Optional: Instagram professional-account connection
INSTAGRAM_APP_ID=YOUR_META_INSTAGRAM_APP_ID
INSTAGRAM_APP_SECRET=YOUR_META_INSTAGRAM_APP_SECRET
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback
INSTAGRAM_API_VERSION=v25.0
INSTAGRAM_WORKSPACE_KEY=technova

# Optional: application port
PORT=3000
```

**Configuration notes:**

- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are needed for the current login flow. Enable the appropriate email and/or OAuth providers in your Supabase project and configure their redirect URLs.
- `DATABASE_URL` is used by Drizzle and migrations. If a database is unavailable, parts of the sample workspace may use **in-memory fallback data**, which is not durable; Instagram persistence specifically requires a database.
- `HINDSIGHT_BASE_URL` and `HINDSIGHT_API_KEY` activate memory operations. The bank ID defaults to `socialmind-technova` in the application code.
- The LLM client reads `BUILT_IN_FORGE_API_KEY` and optionally `BUILT_IN_FORGE_API_URL`. It expects an API compatible with this project's Forge-style completion requests; **a generic API key or endpoint is not guaranteed to be interchangeable**.
- Instagram credentials must match a configured Meta app with the appropriate Instagram Login permissions. Set `INSTAGRAM_REDIRECT_URI` to the exact callback address registered with Meta.
- Never commit `.env`, API secrets, database credentials, or Instagram access tokens.

### 4. Apply database migrations

With `DATABASE_URL` configured and the database created:

```bash
pnpm db:push
```

This script runs Drizzle's generate and migrate commands. Review generated migrations when applying changes to an existing database.

### 5. Start the development server

```bash
pnpm dev
```

Open **http://localhost:3000** (the server may choose the next available port if 3000 is occupied). Sign in through Supabase and click **Load sample data** to explore the dashboard.

> **Windows note:** Some repository scripts use POSIX shell syntax (`NODE_ENV=...`, `mkdir`, `cp`). Use WSL or another compatible shell/runtime when running them on Windows.

## 🧪 Available commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the combined Express + Vite development server. |
| `pnpm build` | Build the frontend and bundle the backend. |
| `pnpm start` | Run the built production server. |
| `pnpm check` | Run TypeScript checking without emitting files. |
| `pnpm test` | Run Vitest tests once. |
| `pnpm format` | Format files with Prettier. |
| `pnpm db:push` | Generate and apply Drizzle database migrations. |
| `pnpm vercel:dev` | Start the Vercel local development environment. |
| `pnpm vercel:build` | Build with the Vercel CLI. |
| `pnpm vercel:deploy` | Deploy to Vercel production via CLI. |

**Testing note:** The `server/hindsight.health.test.ts` integration test expects to reach a real, authenticated Hindsight bank. Running the complete suite without a working Hindsight configuration may fail that test; this should not be mistaken for an isolated application-unit-test failure.

## 🔌 Integrations

### Hindsight: long-term brand memory

SocialMind uses the official Hindsight Node client for three core operations:

- **RETAIN:** Save a brand preference, historical post, or new performance outcome.
- **RECALL:** Find relevant memories for a content question.
- **REFLECT:** Synthesize a memory-backed explanation for a strategy decision.

`GET /api/hindsight/health` makes an authenticated bank check and reports a connected state only when that check succeeds. When Hindsight is unavailable, local analytics can still inform recommendations; the UI does **not** represent database rows as retrieved Hindsight memories.

See [Hindsight integration](docs/HINDSIGHT_INTEGRATION.md) and [SDK notes](docs/HINDSIGHT_SDK_NOTES.md).

### Instagram: account connection and media sync

Once Meta credentials are configured, the Settings page can connect one Instagram professional account through Instagram Login, sync recent media, and disconnect the account. The initial sync imports up to **50 media items**, including available captions, media types, timestamps, likes, and comments. **Reach and shares are not invented** when the authorized API response does not provide those metrics.

The server encrypts stored long-lived Instagram tokens with AES-256-GCM using key material derived from `JWT_SECRET`; tokens are not sent to the browser.

See [Instagram setup guide](docs/INSTAGRAM_INTEGRATION.md) for permissions, callback configuration, and endpoints.

## 📡 API overview

In addition to the typed `/api/trpc` procedures, the Express app defines REST endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/dashboard` | Dashboard metrics and summary. |
| `GET` | `/api/posts` | List and filter historical posts. |
| `POST` | `/api/posts` | Add a post outcome. |
| `POST` | `/api/posts/import` | Import the bundled demonstration dataset. |
| `GET` | `/api/analytics` | Aggregated content analytics. |
| `POST` | `/api/strategy` | Generate an evidence-backed strategy recommendation. |
| `POST` | `/api/content/generate` | Draft content from a brief. |
| `GET` | `/api/memory` | Hindsight status and memory overview. |
| `POST` | `/api/memory/retain` | Save a new memory. |
| `POST` | `/api/memory/recall` | Retrieve matching memories. |
| `POST` | `/api/memory/reflect` | Reflect on a question. |
| `GET` | `/api/hindsight/health` | Verify Hindsight connectivity. |
| `GET` | `/api/instagram/status` | Check Instagram connection state. |
| `POST` | `/api/instagram/sync` | Sync Instagram media. |
| `POST` | `/api/instagram/disconnect` | Remove the Instagram connection. |

Other routes include brand-profile operations and authentication callbacks. Consult [API notes](docs/API.md) and the [server route definitions](server/app.ts) for the complete contract.

**Deployment security:** Review and enforce appropriate authentication, authorization, workspace isolation, and rate limits on REST routes before exposing an instance with production or third-party data. A protected UI does not by itself secure every API endpoint.

## 🎬 Short demo flow

1. Sign in to the **TechNova** example workspace.
2. Load the bundled example posts and inspect the dashboard metrics.
3. Explore topic, format, and posting-time performance in **Analytics**.
4. Ask **“What should we post next week?”** in **AI strategy**.
5. If Hindsight is configured, inspect the memory evidence and RETAIN → RECALL → REFLECT activity.
6. Add a new post result in **Content history**, then ask the strategy question again.
7. Open **Content generator** to draft a post based on the updated evidence.

For a narrated walkthrough, see [the demo script](docs/DEMO_SCRIPT.md).

## 🚢 Deployment

The repository includes a Vercel configuration and an API handler in `api/index.ts`. For deployment:

1. Import the GitHub repository into Vercel or use its CLI.
2. Configure the same **server-side environment variables** in the deployment project.
3. Provision and migrate the production database separately.
4. Update the **Supabase redirect URLs** and, if applicable, the **Meta Instagram redirect URI** to use your deployed domain.
5. Build and validate the frontend, API routes, authentication callbacks, and connected services after deploying.

**Note:** The repository includes a deployment configuration, but this README does not claim a particular public demo URL or a verified live deployment.

## ⚠️ Current limitations

- The supplied workspace and sample data are centered on the **TechNova** demonstration. Review data isolation before using the project as a multi-tenant service.
- Without `DATABASE_URL`, in-memory fallback data is **not persisted across restarts**.
- Hindsight memory depends on a reachable configured bank; generative AI depends on a working compatible LLM provider.
- Instagram sync requires a supported professional account, Meta approvals, and server-side credentials. Some metrics may be unavailable through the authorized API response.
- AI recommendations are intended to assist human content decisions—not guarantee reach, engagement, or growth.

## 🤝 Contributing

Contributions and improvement ideas are welcome. Fork the repository, create a focused branch, run checks where possible, and open a pull request describing your changes. For bugs, include reproduction steps and relevant logs with secrets removed.

## 📄 License

The project declares **MIT** in `package.json`. If you plan to redistribute the project, consider adding a standalone `LICENSE` file with the complete license text.

---

<div align="center">

Built and maintained in [Nagarjuna-1322/SocialMind-Ai](https://github.com/Nagarjuna-1322/SocialMind-Ai).

**SocialMind AI — learn from the last post. Make the next one count.**

</div>
