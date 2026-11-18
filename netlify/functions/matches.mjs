import { getProfiles, publicProfile, readState, json } from './_shared.mjs';

export default async (request) => {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const profiles = getProfiles();
  const state = await readState();
  const matches = state.matches
    .map((id) => profiles.find((profile) => profile.id === id))
    .filter(Boolean)
    .map(publicProfile);

  return json(matches);
};
