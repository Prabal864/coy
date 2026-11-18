import { getProfiles, publicProfile, readState, json } from './_shared.mjs';

export default async (request) => {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const state = await readState();
  const profiles = getProfiles()
    .filter((profile) => !state.swipes[profile.id])
    .map(publicProfile);

  return json(profiles);
};
