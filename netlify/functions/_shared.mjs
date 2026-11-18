import fs from 'node:fs';
import path from 'node:path';
import { getStore } from '@netlify/blobs';

export const initialState = { swipes: {}, matches: [] };
export const stateKey = 'logged-in-user';
export const storeName = 'coy-discovery';

export function getProfiles() {
  const candidates = [
    path.join(process.cwd(), 'data', 'profiles.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, 'utf8'));
    }
  }

  throw new Error('Profile seed data could not be found');
}

export function getStoreClient() {
  return getStore({ name: storeName, consistency: 'strong' });
}

export async function readState() {
  const raw = await getStoreClient().get(stateKey, { type: 'text' });
  if (!raw) return structuredClone(initialState);

  try {
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return structuredClone(initialState);
  }
}

export async function writeState(state) {
  await getStoreClient().set(stateKey, JSON.stringify(state));
}

export function publicProfile(profile) {
  const { likedByUser: _likedByUser, ...safeProfile } = profile;
  return safeProfile;
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}
