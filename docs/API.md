# SocialMind API

All endpoints return JSON. Browser UI calls the equivalent typed tRPC procedures under `/api/trpc`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/dashboard` | Brand, KPIs, trend, performance tables, recent posts, memory status |
| GET | `/api/posts` | List posts; optional `platform`, `topic`, `contentType`, `search` query parameters |
| POST | `/api/posts` | Add a post performance record and retain its outcome when Hindsight is configured |
| POST | `/api/posts/import` | Load missing rows from the bundled sample CSV and request Hindsight retain |
| GET | `/api/analytics` | Analytics-only response |
| POST | `/api/strategy` | Body: `{ "question": "What should we post next week?" }` |
| POST | `/api/content/generate` | Body: `{ objective, topic, format, audience, tone }` |
| GET | `/api/memory` | Memory connection status, operation trace, retrieved memory list |
| POST | `/api/memory/search` | Body: `{ "query": "Which tutorials performed best?" }` |
| GET | `/api/brand` | Current brand profile |
| POST | `/api/brand` | Replace the current brand profile |

## tRPC procedures

- `socialmind.dashboard.query`
- `socialmind.posts.query`
- `socialmind.seed.mutate`
- `socialmind.addPost.mutate`
- `socialmind.strategy.mutate`
- `socialmind.generateContent.mutate`
- `socialmind.memory.query`
- `socialmind.searchMemory.mutate`
- `socialmind.brand.query`
- `socialmind.updateBrand.mutate`

## Example

```bash
curl -s http://localhost:3000/api/strategy \
  -H 'content-type: application/json' \
  -d '{"question":"What should we post next week?"}'
```
