
## Hindsight-specific contract

`GET /api/hindsight/health` performs a real authenticated bank check and returns HTTP `200` only when Hindsight responds successfully. Missing or invalid credentials return HTTP `503` with `connected: false`.

The memory operation endpoints are:

- `POST /api/memory/retain` with `{ content, context?, documentId?, sourcePostIds? }`
- `POST /api/memory/recall` with `{ query }`
- `POST /api/memory/reflect` with `{ query }`
- `GET /api/memory`

The strategy endpoint accepts both `query` and the existing `question` field. It returns both the original camelCase fields used by the React app and integration-friendly fields: `recommendation`, `topics`, `formats`, `posting_times`, `memory_used`, `evidence`, `databaseAnalytics`, `hindsightMemories`, and `aiRecommendation`.
