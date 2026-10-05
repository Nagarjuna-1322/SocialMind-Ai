# Instagram connection

SocialMind now supports connecting one Instagram professional account per workspace using Meta's official **Instagram Login** flow. The browser never receives the Instagram app secret or access token.

## Meta app setup

1. Create or use a Meta developer app with Instagram API / Instagram Login enabled.
2. In Instagram Login business settings, add the exact redirect URI:

   `https://YOUR_DEPLOYED_DOMAIN/api/instagram/callback`

3. Request these permissions for the first version of sync:
   - `instagram_business_basic`
   - `instagram_business_manage_insights`
4. Copy the Instagram App ID and Instagram App Secret into the server environment.

## Server environment

```bash
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
INSTAGRAM_REDIRECT_URI=https://YOUR_DEPLOYED_DOMAIN/api/instagram/callback
INSTAGRAM_API_VERSION=v25.0
INSTAGRAM_WORKSPACE_KEY=technova
```

`JWT_SECRET` is also required because SocialMind encrypts the long-lived Instagram access token with AES-256-GCM before storing it in `instagramConnections`. The raw token is never returned by an API response or bundled into the React app.

## User flow

1. Open **Settings → Instagram account**.
2. Select **Connect Instagram**.
3. Approve the Meta permission screen.
4. SocialMind exchanges the one-time authorization code for a long-lived token, verifies the Instagram profile, and stores encrypted connection metadata.
5. Select **Sync posts** to import the latest 50 media items into the existing `socialPosts` table.
6. Imported media appears in Content history, Analytics, strategy evidence, and the memory loop.

The current sync imports caption, media type, timestamp, likes, and comments. Reach and share metrics remain zero when Meta does not return approved insights for the connected account; the UI explains this instead of inventing values.

## API endpoints

- `GET /api/instagram/connect` — begins OAuth.
- `GET /api/instagram/callback` — validates state and stores the encrypted token.
- `GET /api/instagram/status` — returns safe connection status only.
- `POST /api/instagram/sync` — imports or updates Instagram media.
- `POST /api/instagram/disconnect` — removes the workspace connection and encrypted token.
