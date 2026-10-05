
## Instagram integration completed

- [x] Add Instagram Login OAuth start/callback with CSRF state validation.
- [x] Add AES-256-GCM encrypted long-lived token storage in `instagramConnections`.
- [x] Add safe connection status, disconnect, and sync endpoints.
- [x] Add idempotent Instagram media import into the existing `socialPosts` analytics table.
- [x] Add Settings UI for Connect Instagram, Sync posts, status, and Disconnect.
- [x] Add Meta setup and deployment documentation.
- [x] Apply migration `0002_curious_elektra.sql` to create `instagramConnections`.
- [x] Verify frozen install, `pnpm check`, all 5 tests, production build, REST/tRPC contracts, OAuth redirect construction, and invalid-state rejection.

Activation still requires the user’s Meta app credentials in the server environment; the UI intentionally shows Instagram as not configured until those values are present.
