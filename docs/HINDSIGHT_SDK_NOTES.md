# Hindsight integration notes

Sources consulted during implementation:

- [Official Python SDK guide](https://hindsight.vectorize.io/sdks/python)
- [Official Node.js SDK guide](https://hindsight.vectorize.io/sdks/nodejs)
- [Official API reference](https://hindsight.vectorize.io/api-reference)

The application uses the official Node client package `@vectorize-io/hindsight-client` and keeps it server-side.

## Methods used

```ts
const client = new HindsightClient({ baseUrl, apiKey });
await client.retain(bankId, content, options);
await client.retainBatch(bankId, items, { async: true });
await client.recall(bankId, query, { budget: "mid", maxTokens: 3000, includeChunks: true });
await client.reflect(bankId, query, { budget: "low", includeFacts: true });
await client.listMemories(bankId, { limit: 18, offset: 0 });
```

The service maps `document_id` / `documentId`, timestamps, metadata, and tags to source post IDs where available. Hindsight errors are caught and recorded as `memoryEvents` without claiming a successful memory write.
