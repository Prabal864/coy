const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const app = express();
const port = process.env.PORT || 3001;
const dataDir = path.join(__dirname, 'data');
const profiles = JSON.parse(fs.readFileSync(path.join(dataDir, 'profiles.json'), 'utf8'));
const statePath = path.join(dataDir, 'state.json');
const initialState = { swipes: {}, matches: [] };

function readState() {
  try {
    return { ...initialState, ...JSON.parse(fs.readFileSync(statePath, 'utf8')) };
  } catch {
    return structuredClone(initialState);
  }
}

function writeState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function publicProfile(profile) {
  const { likedByUser: _likedByUser, ...safeProfile } = profile;
  return safeProfile;
}

app.use(express.json());

app.get('/feed', (_req, res) => {
  const state = readState();
  const feed = profiles
    .filter((profile) => !state.swipes[profile.id])
    .map(publicProfile);
  res.json(feed);
});

app.post('/swipe', (req, res) => {
  const { profileId, action } = req.body || {};
  const profile = profiles.find((candidate) => candidate.id === profileId);
  if (!profile || !['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'profileId and action (like or pass) are required' });
  }

  const state = readState();
  if (state.swipes[profileId]) {
    return res.status(409).json({ error: 'This profile has already been swiped on' });
  }

  state.swipes[profileId] = action;
  const isMatch = action === 'like' && profile.likedByUser;
  if (isMatch && !state.matches.includes(profileId)) state.matches.push(profileId);
  writeState(state);

  res.json({
    match: isMatch,
    profile: isMatch ? publicProfile(profile) : null,
    remaining: profiles.length - Object.keys(state.swipes).length,
  });
});

app.get('/matches', (_req, res) => {
  const state = readState();
  res.json(
    state.matches
      .map((id) => profiles.find((profile) => profile.id === id))
      .filter(Boolean)
      .map(publicProfile),
  );
});

app.post('/reset', (_req, res) => {
  writeState(structuredClone(initialState));
  res.status(204).end();
});

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(port, () => console.log(`Coy API listening on http://localhost:${port}`));
