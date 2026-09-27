
## Hindsight integration status

The existing React frontend remains intact. Hindsight is integrated into the existing server-side backend through the official client, with bank verification before reads/writes. Use `GET /api/hindsight/health` to test the configured connection. The UI only shows **Hindsight Connected** after that backend health check succeeds; otherwise it clearly shows **Hindsight Not Connected** and never fabricates retained memories. See [HINDSIGHT_INTEGRATION.md](docs/HINDSIGHT_INTEGRATION.md) for the endpoint contract and error behavior.
