# Hindsight integration contract

SocialMind preserves the existing application architecture and keeps all Hindsight credentials server-side. The current WebDev project uses the existing TypeScript/Express backend and the official `@vectorize-io/hindsight-client` package; it does not rebuild the React frontend or create a separate application. This is the backend-compatible equivalent of the supplied Python SDK brief because the existing application backend is TypeScript rather than Python.

## Lifecycle

- **RETAIN** stores a social-post outcome, brand preference, or manual learning event.
- **RECALL** retrieves relevant memories for audience, topic, format, or performance questions.
- **REFLECT** reasons over accumulated memories for strategic questions.

## Endpoints

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/api/hindsight/health` | Performs an authenticated bank-profile check. Returns `200` only after a successful Hindsight round trip; otherwise returns `503` with `connected: false`. |
| POST | `/api/memory/retain` | Body `{ content, context?, documentId?, sourcePostIds? }`; retains only when the bank is verified. |
| POST | `/api/memory/recall` | Body `{ query }`; returns Hindsight items or an explicit unavailable/error state. |
| POST | `/api/memory/reflect` | Body `{ query }`; returns the reflect text or an explicit unavailable/error state. |
| GET | `/api/memory` | Returns bank status, recent operation events, retrieved memory list, learned observations, and lifecycle metadata. |
| POST | `/api/strategy` | Accepts either `{ query }` or the legacy `{ question }`; returns database analytics, Hindsight memories, AI recommendation, evidence, and snake_case aliases for integration clients. |

The frontend status indicator is driven by the health-derived service status. It never shows green merely because an API key is present. Missing keys, invalid keys, invalid bank IDs, timeouts, unavailable service responses, empty memories, and retain/recall/reflect failures are surfaced as non-connected states and persisted in the local operation trace without fabricating Hindsight output.
