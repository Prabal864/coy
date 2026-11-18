# Coy Discover

Standalone mobile-first Discover tab for the Coy SDE intern assignment.

## Part A: Suggested core features

### 1. Private social-circle discovery

Let users discover people through verified shared contexts such as a college, workplace, event, or friend group, while keeping the user's identity private until interest is mutual. This is required because Coy's strongest differentiator is helping people explore existing crushes safely; relevant context also makes the discovery experience more useful than a generic catalogue of strangers.

### 2. Mutual-match conversation handoff

When two people like each other, provide a lightweight, consent-based next step such as an optional conversation prompt or contact request. This is required because the mutual match should become a meaningful connection rather than an endpoint, while keeping the user in control and avoiding the pressure of an unsolicited message.

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
