# Coy Discover

Standalone mobile-first Discover tab for the Coy SDE intern assignment.

## Features

- 32 seeded profiles with photos, bios, locations, and interests.
- Pointer/touch drag gestures and desktop action buttons.
- Profiles disappear permanently after a swipe.
- Mutual likes create a match modal and populate Matches.
- The API never sends `likedByUser`, protecting private likes.
- Swipe and match state persists in `data/state.json`.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Production: `npm run build` then `npm run server`.

## API

- `GET /feed`
- `POST /swipe` with `{ "profileId": "p01", "action": "like" | "pass" }`
- `GET /matches`
- `POST /reset` (demo convenience)

## Deploy on Netlify

A traditional database is not required for this demo. Netlify Blobs stores the single demo user's swipes and matches across serverless invocations.

1. Push the repository to GitHub.
2. In Netlify, choose **Add new project → Import an existing project**.
3. Select the repository and accept:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. `netlify.toml` redirects `/feed`, `/swipe`, `/matches`, and `/reset` to the Netlify Functions.

Local Netlify simulation:

```bash
npm run dev:netlify
```

The serverless functions use `@netlify/blobs`; Netlify provides Blobs credentials automatically in deployed and Netlify CLI environments. Use a database such as PostgreSQL or Supabase instead only if you add real accounts, concurrent users, or server-side authorization.
