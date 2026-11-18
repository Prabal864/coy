import { getProfiles, publicProfile, readState, writeState, json } from './_shared.mjs';

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'A JSON request body is required' }, 400);
  }

  const { profileId, action } = body || {};
  const profile = getProfiles().find((candidate) => candidate.id === profileId);
  if (!profile || !['like', 'pass'].includes(action)) {
    return json({ error: 'profileId and action (like or pass) are required' }, 400);
  }

  const state = await readState();
  if (state.swipes[profileId]) {
    return json({ error: 'This profile has already been swiped on' }, 409);
  }

  state.swipes[profileId] = action;
  const isMatch = action === 'like' && profile.likedByUser;
  if (isMatch && !state.matches.includes(profileId)) state.matches.push(profileId);
  await writeState(state);

  return json({
    match: isMatch,
    profile: isMatch ? publicProfile(profile) : null,
    remaining: getProfiles().length - Object.keys(state.swipes).length,
  });
};
